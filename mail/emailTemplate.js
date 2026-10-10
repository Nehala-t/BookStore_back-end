import fs from "fs";

import path from "path";

import Handlebars from "handlebars";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// =====================================================
// LOAD TEMPLATE
// =====================================================

const loadTemplate = (templateName) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "views",
    templateName
  );

  console.log(
    "Loading email template:",
    templatePath
  );

  return fs.readFileSync(
    templatePath,
    "utf-8"
  );
};

// =====================================================
// BOOK DELETE EMAIL
// =====================================================

export const bookDeleteTemplate = ({
  sellerName,
  bookTitle,
  author,
}) => {
  const templateSource = loadTemplate(
    "bookdelete_template.hbs"
  );

  const template =
    Handlebars.compile(templateSource);

  return template({
    sellerName,
    bookTitle,
    author,
    year: new Date().getFullYear(),
  });
};

// =====================================================
// ACCOUNT STATUS EMAIL
// =====================================================

export const accountStatusTemplate = ({
  firstName,
  status,
}) => {
  const templateSource = loadTemplate(
    "account_status_template.hbs"
  );

  const template =
    Handlebars.compile(templateSource);

  return template({
    firstName,
    status,
    year: new Date().getFullYear(),
  });
};