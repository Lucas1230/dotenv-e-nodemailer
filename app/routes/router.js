const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const validacoes = [
  body("nome")
    .trim()
    .notEmpty().withMessage("Informe seu nome.")
    .isLength({ min: 3 }).withMessage("O nome deve ter pelo menos 3 caracteres."),
  body("email")
    .trim()
    .notEmpty().withMessage("Informe seu e-mail.")
    .isEmail().withMessage("E-mail inválido."),
  body("telefone")
    .trim()
    .notEmpty().withMessage("Informe seu telefone.")
    .matches(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/)
    .withMessage("Telefone inválido. Ex.: (11) 91234-5678"),
  body("assunto")
    .trim()
    .notEmpty().withMessage("Informe o assunto."),
  body("mensagem")
    .trim()
    .notEmpty().withMessage("Escreva uma mensagem.")
    .isLength({ min: 10 }).withMessage("A mensagem deve ter pelo menos 10 caracteres."),
];

router.get("/", (req, res) => {
  res.render("index", { erros: [], dados: {}, sucesso: false });
});

router.post("/enviar", validacoes, (req, res) => {
  const erros = validationResult(req);

  if (!erros.isEmpty()) {
    return res.render("index", {
      erros: erros.array(),
      dados: req.body,
      sucesso: false,
    });
  }

  const { nome, email, telefone, assunto, mensagem } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: assunto,
    text: `Nome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\nMensagem: ${mensagem}`,
    html: `<h2>Novo contato</h2>
           <p><b>Nome:</b> ${nome}</p>
           <p><b>E-mail:</b> ${email}</p>
           <p><b>Telefone:</b> ${telefone}</p>
           <p><b>Assunto:</b> ${assunto}</p>
           <p><b>Mensagem:</b> ${mensagem}</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.render("index", {
        erros: [{ msg: "Não foi possível enviar o e-mail." }],
        dados: req.body,
        sucesso: false,
      });
    } else {
      console.log(info);
      console.log("email enviado");
      res.render("index", { erros: [], dados: {}, sucesso: true });
    }
  });
});

module.exports = router;