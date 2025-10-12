// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
// Allow requests from frontend dev server (change FRONTEND_URL in .env if needed)
// Accept both localhost and 127.0.0.1 and allow Authorization header for XHR/fetch
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean);
const corsOptions = { origin: allowedOrigins, credentials: true, allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], methods: ['GET','POST','PUT','DELETE','OPTIONS'] };
app.use(cors(corsOptions));
// respond to preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());

// Load env variables
const { MONGO_URI, JWT_SECRET, PORT = 5000 } = process.env;

// --------------------
// MongoDB Models
// --------------------
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  hearts: { type: Number, default: 5 },
  avatar: String
});
const User = mongoose.model("User", userSchema);

const postSchema = new mongoose.Schema({
  emotion: String,
  author: String,
  title: String,
  excerpt: String,
  content: String,
  cost: Number,
  free: Boolean,
  images: [String],
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});
const Post = mongoose.model("Post", postSchema);

// --------------------
// Middleware
// --------------------
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers?.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : null;
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

// --------------------
// Routes
// --------------------

// Register user
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(400).json({ error: "Username already exists" });
  }
});

// Login user
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, username: user.username, hearts: user.hearts });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all posts
app.get("/api/posts", async (req, res) => {
  try {
    // pagination: ?page=1&limit=10
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    let posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    // map images to absolute URLs
    const origin = req.protocol + '://' + req.get('host');
    posts = posts.map(p => ({ ...p, images: (p.images||[]).map(src => src && src.startsWith('http') ? src : `${origin}${src}`) }));
    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Fetch posts error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Create post
// Create post (supports multipart images)
app.post("/api/posts", authMiddleware, (req, res, next) => {
  // limit files to 6 using multer middleware
  const uploader = upload.array('images', 6);
  uploader(req, res, function(err){
    if(err) return next(err);
    console.log('POST /api/posts - files:', (req.files||[]).map(f=>f.filename));
    next();
  });
}, async (req, res) => {
  try {
    const body = req.body || {};
    const images = (req.files || []).map(f => {
      const p = `/uploads/${f.filename}`;
      return p.startsWith('/') ? p : '/' + p;
    });
    const postData = {
      emotion: body.emotion,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      cost: body.cost,
      free: body.free === 'true' || body.free === true,
      images,
      userId: req.user.id,
      author: req.user.username
    };
    const post = new Post(postData);
    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Create post error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Debug: list uploads folder
app.get('/api/uploads-list', (req, res) => {
  try{
    const files = fs.readdirSync(UPLOADS_DIR).map(name=>{
      const stat = fs.statSync(path.join(UPLOADS_DIR, name));
      return { name, size: stat.size, mtime: stat.mtime };
    });
    res.json({ ok:true, files });
  }catch(err){ res.status(500).json({ error: err.message }) }
});

// attach multer error handler after upload routes
app.use(multerErrorHandler);

// Unlock post
app.post("/api/unlock/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { cost } = req.body;
    if (user.hearts < cost) return res.status(400).json({ error: "Not enough hearts" });

    user.hearts -= cost;
    await user.save();
    res.json({ ok: true, hearts: user.hearts });
  } catch (err) {
    console.error("Unlock error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get posts for a specific user
app.get('/api/posts/user/:id', async (req, res) => {
  try {
    let posts = await Post.find({ userId: req.params.id }).sort({ createdAt: -1 }).lean();
    const origin = req.protocol + '://' + req.get('host');
    posts = posts.map(p => ({ ...p, images: (p.images||[]).map(src => src && src.startsWith('http') ? src : `${origin}${src}`) }));
    res.json(posts);
  } catch (err) {
    console.error('Fetch user posts error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get posts for the authenticated user
app.get('/api/my-posts', authMiddleware, async (req, res) => {
  try {
    // support pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const total = await Post.countDocuments({ userId: req.user.id });
    const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  let postsLean = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  const origin = req.protocol + '://' + req.get('host');
  postsLean = postsLean.map(p => ({ ...p, images: (p.images||[]).map(src => src && src.startsWith('http') ? src : `${origin}${src}`) }));
  res.json({ posts: postsLean, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Fetch my posts error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve uploaded avatars and configure multer - compute __dirname reliably in ESM
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
// compute __dirname reliably in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');
// ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));
// configure multer with basic file type and size checks
const storage = multer.diskStorage({
  destination: function(req, file, cb){ cb(null, UPLOADS_DIR) },
  filename: function(req, file, cb){ const ext = path.extname(file.originalname); cb(null, Date.now() + ext) }
});
const fileFilter = (req, file, cb) => {
  // accept based on mimetype for stronger validation
  const allowed = ['image/jpeg','image/png','image/gif','image/jpg','image/webp'];
  if(allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// middleware to handle multer errors cleanly
function multerErrorHandler(err, req, res, next){
  if(err instanceof multer.MulterError){
    // handle Multer-specific errors
    return res.status(400).json({ error: err.message });
  }
  if(err){
    return res.status(400).json({ error: err.message || 'Upload error' });
  }
  next();
}

// basic request logger for debugging uploads
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// temporary test upload route (no auth) to verify multer + static serving
app.post('/api/test-upload', upload.single('file'), (req, res) => {
  if(!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // return the absolute public url
  const origin = req.protocol + '://' + req.get('host');
  const publicUrl = `${origin}/uploads/${req.file.filename}`;
  res.json({ ok: true, file: req.file.filename, url: publicUrl });
});

// Upload avatar
app.post('/api/profile/avatar', authMiddleware, upload.single('avatar'), async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({ error: 'No file' });
    const user = await User.findById(req.user.id);
  user.avatar = `/uploads/${req.file.filename}`.startsWith('/') ? `/uploads/${req.file.filename}` : '/' + `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ avatar: user.avatar });
  }catch(err){ console.error('Avatar upload error', err.message); res.status(500).json({ error: 'Server error' }) }
});

// Simple search endpoint
app.get('/api/search', async (req,res)=>{
  try{
    const q = (req.query.q || '').trim();
    if(!q) return res.json([]);
    const re = new RegExp(q, 'i');
    const posts = await Post.find({ $or: [{ title: re }, { excerpt: re }, { content: re }, { emotion: re }] }).limit(50).sort({ createdAt: -1 });
    const origin = req.protocol + '://' + req.get('host');
    const postsLean = posts.map(p => ({ ...p.toObject(), images: (p.images||[]).map(src => src && src.startsWith('http') ? src : `${origin}${src}`) }));
    res.json(postsLean);
  }catch(err){ console.error('Search error', err.message); res.status(500).json({ error:'Server error' }) }
});

// Simple trade endpoint (create a trade request)
const tradeSchema = new mongoose.Schema({ fromUser: String, toUser: String, item: String, message: String, createdAt:{type:Date,default:Date.now} });
const Trade = mongoose.model('Trade', tradeSchema);
app.post('/api/trade', authMiddleware, async (req,res)=>{
  try{
    const t = new Trade({ fromUser: req.user.username, ...req.body });
    await t.save();
    res.json({ ok:true, trade: t });
  }catch(err){ console.error('Trade error', err.message); res.status(500).json({ error:'Server error' }) }
});

// --------------------
// Connect to MongoDB & Start Server
// --------------------
// Start the HTTP server immediately and bind to IPv4 loopback by default
const HOST = process.env.HOST || '127.0.0.1';
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Backend running at http://${HOST}:${PORT}`);
});
server.on('error', (err) => console.error('Server error:', err));

// Connect to MongoDB in background; log errors but keep server running so frontend can load
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 10000, family: 4 })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error (will keep retrying):', err.message || err));
