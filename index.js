const express = require("express");
const path = require("path");
const createError = require("http-errors");
const fs = require("fs").promises;
const multer = require("multer");

const createFolderIfNotExist = require("./helpers");

const app = express();

app.use("/public", express.static("public"));

// musimy sprecyzowac miejsce przechowywania plików - FOLDER
const storeImage = path.join(process.cwd(), "images");

// musimy zainicjalizowac storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storeImage);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});

// obsługujemy obrazek przy pomocy multera
const upload = multer({ storage });

app.post("/upload", upload.single("picture"), async (req, res, next) => {
  // wyciagamy dane na temat przychodzacego pliku
  const { path: temporaryName, originalname } = req.file;

  // tworzymy absoultną ściezkę do PLIKU docelowego
  const fileName = path.join(storeImage, originalname);
  try {
    // podmieniamy tymczasową nazwę na własciwą
    await fs.rename(temporaryName, fileName);

    console.log(fileName);

    // wrzucamy nasz plik do cloud storage ====> path

    // zapisujemy sciezke do bazy danych
  } catch (err) {
    // jeśli coś poszło nie tak to usuwamy i zwracamy error
    await fs.unlink(temporaryName);
    return next(err);
  }

  return res.status(200).send("plik załadowany pomyślnie");
});

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ errorMessage: err.message, stauts: err.status });
});

app.listen(3000, async () => {
  createFolderIfNotExist(storeImage);
  console.log("app is listening.....");
});
