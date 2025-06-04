import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

const db = SQLite.openDatabaseSync("chatDatabase.db");

const initializeDatabase = () => {
  console.log("start init");

  try {
    db.execSync(
      `CREATE TABLE IF NOT EXISTS chat (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title TEXT, 
        thread_id TEXT, 
        id_backend INTEGER, 
        last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("Chat table created");
  } catch (error) {
    console.log("Error in creating chat table", error);
  }

  try {
    db.execSync(
      `CREATE TABLE IF NOT EXISTS message (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        sender TEXT,
        chat_id INTEGER,  -- Ajout de la colonne chat_id
        type TEXT DEFAULT 'message',
        FOREIGN KEY(chat_id) REFERENCES chat(id)  -- Référence à la colonne id de la table chat
      );`
    );

    console.log("Message table created");
  } catch (error) {
    console.log("Error in creating message table", error);
  }
};

export const getMessagesByChatId = async (chatId, callback) => {
  console.log("getMessage", chatId);
  const statement = await db.prepareAsync(
    "SELECT id, content, sender, chat_id, type FROM message WHERE chat_id = $chatId"
  );

  try {
    let result = await statement.executeAsync({ $chatId: chatId });
    const allRows = await result.getAllAsync();

    callback(null, allRows);
  } finally {
    await statement.finalizeAsync();
  }
};

export const getDatabase = () => {
  return db;
};

export const saveChatToLocalDB = async (chat) => {
  const statement = await db.prepareAsync(
    "INSERT INTO chat (title, thread_id, id_backend) VALUES ($title,$thread_id,$id_backend)"
  );

  try {
    let result = await statement.executeAsync({
      $title: chat.title,
      $thread_id: chat.thread_id,
      $id_backend: chat.id_backend || "null",
    });
    return result.lastInsertRowId;
  } finally {
    await statement.finalizeAsync();
  }
};

export const updateChatTitle = async (chat) => {
  const updateChatStatement = await db.prepareAsync(
    "UPDATE chat SET title = $title WHERE id = $chatId"
  );

  try {
    let result = await updateChatStatement.executeAsync({
      $title: chat.title,
      $chatId: chat.id,
    });
  } finally {
    await updateChatStatement.finalizeAsync();
  }
};

export const updateChatThreadId = async (chat) => {
  const updateChatStatement = await db.prepareAsync(
    "UPDATE chat SET thread_id = $thread_id WHERE id = $chatId"
  );

  try {
    let result = await updateChatStatement.executeAsync({
      $thread_id: chat.thread_id,
      $chatId: chat.id,
    });
  } finally {
    await updateChatStatement.finalizeAsync();
  }
};


export const saveMessageToLocalDB = async (message) => {
  const statement = await db.prepareAsync(
    "INSERT INTO message (content, sender, chat_id, type) VALUES ($content, $sender, $chat_id, $type)"
  );

  try {
    let result = await statement.executeAsync({
      $content: message.content,
      $sender: message.sender,
      $chat_id: message.chat,
      $type: message.type || "message",
    });

  
    const updateChatStatement = await db.prepareAsync(
      "UPDATE chat SET last_modified = CURRENT_TIMESTAMP WHERE id = $chatId"
    );
    await updateChatStatement.executeAsync({ $chatId: message.chat });
    await updateChatStatement.finalizeAsync();

    return result.lastInsertRowId;
  } finally {
    await statement.finalizeAsync();
  }
};

export const updateMessageContent = async (message) => {
  const updateMessageStatement = await db.prepareAsync(
    "UPDATE message SET content = $content WHERE id = $id"
  );

  try {
    await updateMessageStatement.executeAsync({
      $content: message.content,
      $id: message.id,
    });
  } finally {
    await updateMessageStatement.finalizeAsync();
  }
};

export const deleteAllMessage = async () => {
  const statement = await db.runAsync("DELETE from message;");
  const statement2 = await db.runAsync("DELETE from chat;");
};

export const getAllChat = async (callback) => {
  const statement = await db.prepareAsync(
    "SELECT * FROM chat ORDER BY last_modified DESC"
  );

  try {
    let result = await statement.executeAsync();
    const allRows = await result.getAllAsync();

    callback(null, allRows);
  } finally {
    await statement.finalizeAsync();
  }
};

export const updateFirstMessage = async (id, chatId) => {
  const statement = await db.prepareAsync(
    "UPDATE message SET chat_id = $chatId WHERE id=$id"
  );

  try {
    let result = await statement.executeAsync({
      $id: id,
      $chatId: chatId,
    });

    console.log("updated");
  } finally {
    await statement.finalizeAsync();
  }
};

export default initializeDatabase;
