const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter
  .verify()
  .then(() => {
    console.log('Servicio de correo conectado correctamente');
  })
  .catch((err) => {
    console.error(
      'No se pudo conectar al servicio de correo:',
      err.message
    );
  });

/**
 * Envía un correo.
 * @param {string} destinatario - correo del receptor
 * @param {string} asunto - asunto del correo
 * @param {string} mensajeHtml - contenido en HTML
 */
async function enviarCorreo(destinatario, asunto, mensajeHtml) {
  try {
    await transporter.sendMail({
      from: `"VetCare" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: mensajeHtml,
    });
    console.log(`Correo enviado a ${destinatario}: ${asunto}`);
  } catch (err) {
    // No queremos que un fallo de correo tumbe la operación principal
    // (ej. si el correo falla, la cita YA se agendó en la base igual)
    console.error('Error al enviar correo:', err.message);
  }
}

module.exports = { enviarCorreo };