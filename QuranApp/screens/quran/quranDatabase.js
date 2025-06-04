import * as SQLite from "expo-sqlite";

export const getAllSourates = async (dbContext, callback) => {
  const statement = await dbContext.prepareAsync(
    "SELECT id, name_simple, name_ar, name_fr, ordre_revelation, type_revelation,nombre_versets,type_revelation FROM source_sourates"
  );

  try {
    const result = await statement.executeAsync();
    const allRows = await result.getAllAsync();
    callback(null, allRows);
  } finally {
    await statement.finalizeAsync();
  }
};

export const getVersesBySourateId = async (dbContext, sourateId, callback) => {
  const statement = await dbContext.prepareAsync(
    `SELECT v.id,v.numero, v.texte_arabe, t.texte AS texte_francais
       FROM versets v
       INNER JOIN traductions_fr t ON v.id = t.verset_id
       WHERE v.sourate_id = $sourateId`
  );

  try {
    const result = await statement.executeAsync({ $sourateId: sourateId });
    const allRows = await result.getAllAsync();
    callback(null, allRows);
  } finally {
    await statement.finalizeAsync();
  }
};


export const getSourateByName = async (dbContext, name, callback) => {
  const statement = await dbContext.prepareAsync(
    "SELECT * FROM source_sourates WHERE name_simple LIKE $name OR name_fr LIKE $name"
  );

  try {
    const result = await statement.executeAsync({ $name: `%${name}%` });
    const allRows = await result.getAllAsync();
    callback(null, allRows);
  } finally {
    await statement.finalizeAsync();
  }
};

export const getSourateById = async (dbContext, id, callback) => {
  const statement = await dbContext.prepareAsync(
    "SELECT * FROM source_sourates WHERE id=$id"
  );
  try {
    const result = await statement.executeAsync({ $id: id });
    const row = await result.getFirstAsync();
    callback(null, row);
  } finally {
    await statement.finalizeAsync();
  }
};


export const getVersesByKeywordPaginated = async (
  dbContext,
  keyword,
  pageNumber,
  callback
) => {
  const pageSize = 100;
  const offset = (pageNumber - 1) * pageSize;

  const statement = await dbContext.prepareAsync(
    `SELECT v.id, v.sourate_id, v.numero, s.name_simple AS sourate_name, t.texte AS translation,
            COUNT(*) OVER() AS total_count
       FROM versets v
       INNER JOIN source_sourates s ON v.sourate_id = s.id
       INNER JOIN traductions_fr t ON v.id = t.verset_id
       WHERE t.texte LIKE $keyword
       LIMIT $pageSize OFFSET $offset`
  );

  try {
    const result = await statement.executeAsync({
      $keyword: `%${keyword}%`,
      $pageSize: pageSize,
      $offset: offset,
    });
    const allRows = await result.getAllAsync();
    callback(null, allRows);
  } catch (error) {
    callback(error);
  } finally {
    await statement.finalizeAsync();
  }
};

export const getTafsirByKeyVerse = async (dbContext, id, callback) => {
  console.log(id);
  const statement = await dbContext.prepareAsync(
    `SELECT tafsir FROM tafsir_en WHERE id=$id`
  );

  try {
    const result = await statement.executeAsync({
      $id: id,
    });
    const allRows = await result.getFirstAsync();
    callback(null, allRows);
  } catch (error) {
    callback(error);
  } finally {
    await statement.finalizeAsync();
  }
};

export const getQuranReferences = async (
  dbContext,
  sourateId,
  startVerse,
  endVerse = null,
  callback
) => {
  const query = endVerse
    ? `SELECT v.id, v.numero, v.texte_arabe,v.sourate_id, t.texte AS texte_francais
         FROM versets v
         INNER JOIN traductions_fr t ON v.id = t.verset_id
         WHERE v.sourate_id = $sourateId AND v.numero BETWEEN $startVerse AND $endVerse`
    : `SELECT v.id, v.numero, v.texte_arabe,v.sourate_id, t.texte AS texte_francais
         FROM versets v
         INNER JOIN traductions_fr t ON v.id = t.verset_id
         WHERE v.sourate_id = $sourateId AND v.numero = $startVerse`;

  const statement = await dbContext.prepareAsync(query);

  try {
    const result = await statement.executeAsync({
      $sourateId: sourateId,
      $startVerse: startVerse,
      $endVerse: endVerse || startVerse,
    });
    const allRows = await result.getAllAsync();
    callback(null, allRows);
  } catch (error) {
    callback(error);
  } finally {
    await statement.finalizeAsync();
  }
};

export default {
  getAllSourates,
  getVersesBySourateId,
  getSourateByName,
  getVersesByKeywordPaginated,
  getSourateById,
  getTafsirByKeyVerse,
};
