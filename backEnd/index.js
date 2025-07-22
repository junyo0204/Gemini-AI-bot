import dotenv from 'dotenv';
import axios from 'axios';
import mysql from 'mysql2/promise';
import express from "express";
import cors from "cors"; // 允許跨域請求

dotenv.config();
const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'chat-bot',
});

app.listen(port, () => {
  console.log(`伺服器啟動：http://localhost:${port}`);
});

// 取得歷史紀錄
app.get('/api/history', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM history_list');
    res.json(rows);
  } catch (err) {
    console.error('error:', err.message);
    res.status(500).json({ error: '資料庫錯誤' });
  }
});


// 透過選擇的room_id 列出該聊天室內訊息
app.get('/api/rooms/:id/messages', async (req, res) => {
  const roomId = req.params.id;
  try {
    const [rows] = await pool.query(
      'SELECT id, user_message, ai_response, created_at FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC',
      [roomId]
    );
    res.json({ messages: rows });
  } catch (error) {
    console.error('資料庫錯誤：', error.message);
    res.status(500).json({ error: '取得訊息失敗' });
  }
});


// POST /api/gemini - 傳入 prompt 取得 Gemini 回應
app.post('/api/gemini', async (req, res) => {
  let { prompt, room_id } = req.body;
  let text = {};
  // 檢查輸入
  if (!prompt || prompt.trim() == "") {
    return ;
  }
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };
  try {
    // 發送到 Gemini API
    const response = await axios.post(GEMINI_API_URL, requestBody);
    text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '(無回應)';

    //傳值來的room_id等於0時, 視為新增聊天室,最後會將room_id設定為資料表內最大值
    if (!room_id) {
      const autoTitle = text.slice(0, 20).replace(/\n/g, ''); //取ai回應前20個字當聊天室標題
      await pool.query(
        'INSERT INTO history_list (h_name) VALUES (?)', [autoTitle]
      ); //將新聊天室標題存入table
      const [max_id] = await pool.query('SELECT MAX(h_id) AS max_h_id FROM history_list'); 
      //取得room_id的最大值
      room_id = max_id[0].max_h_id;
    }

    //將room_id, user的問題, ai的回應, 存入chat_messages資料表
    await pool.query(
      'INSERT INTO chat_messages (room_id, user_message, ai_response) VALUES (?, ?, ?)',
      [room_id, prompt, text]
    );

    // 回傳room_id
    res.json({ response: room_id });
  } catch (error) {
    console.error('錯誤：', error.response?.data || error.message);
    res.status(500).json({ error: 'Gemini API 請求失敗' });
  }
});

//DELETE /api/rooms/:id 刪除rooms
app.delete('/api/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM history_list WHERE h_id = ?', [roomId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ state: false });
    }
    res.json({ state: true });
  } catch (error) {
    console.error('刪除聊天室錯誤：', error.message);
    res.json({ state: false });
  }
});

