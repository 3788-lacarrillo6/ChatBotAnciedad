import express from "express";
import cors from "cors";
import axios from "axios"; // Para realizar solicitudes HTTP a Python

const app = express();
const port = 3001;

app.use(express.json());  // Asegúrate de tener este middleware para procesar solicitudes JSON
app.use(cors({ origin: "*" }));

// Endpoint principal
app.get("/", (req, res) => {
  res.send("Hello from the agent server!");
});

app.post("/agent", async (req, res) => {
  const { message, thread_id } = req.body;

  // Verificar que el mensaje y el thread_id están presentes
  console.log("Mensaje recibido en el servidor Node.js:", { message, thread_id });

  if (!message || !thread_id) {
    return res.status(400).json({ error: "Falta mensaje o thread_id" });
  }

  try {
    // Enviar el mensaje al servidor Python
    const response = await axios.post("http://localhost:5000/agent", {
      message: message,
    });
    
    console.log("Respuesta del servidor Python:", response.data.response);
    res.json({ response: response.data.response });
  } catch (error) {
    console.error("Error communicating with Python server:", error);
    res.status(500).json({ error: "Error communicating with Python server" });
  }
});



app.listen(port, () => {
  console.log(`Agent server is running at http://localhost:${port}`);
});
