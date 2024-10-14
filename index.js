import express from "express";
import axios from "axios";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import user from "./models/usermodel.js";
import doctor from "./models/doctormodel.js";
import appointment from "./models/appointment.js";
import http from "http";
import { Server } from "socket.io"; // Importation de la classe Server

const app = express();
const server = http.createServer(app);
const io = new Server(server); // Initialisation de Socket.io avec le serveur

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Middleware pour gérer les connexions Socket.io
let clients = {};

io.on("connection", (socket) => {
  console.log("Connected");
  console.log(socket.id, "has joined");
  
  socket.on("signin", (id) => {
    console.log(id);
    clients[id] = socket;
    console.log(clients);
  });

  socket.on("message", (msg) => {
    console.log(msg);
    let targetId = msg.targetId;
    if (clients[targetId]) clients[targetId].emit("message", msg);
  });
});
app.route("/check").get((req,res)=> {
  return res.json(" votre app marche bien");

})

app.post("/api/user/registerUser", async (req, res) => {
  const { name, pass } = req.body;
  try {
    if (!name || !pass) {
      return res.status(400).json({ msg: "Pls fill all fields" });
    }
    let User = await user.findOne({ name, pass });
    if (User) {
      return res.status(400).json({ msg: "User already exists" });
    }
    User = new user({ name, pass });
    await User.save();
    res.status(200).json({ msg: "Success" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Login User
app.post("/api/user/loginUser", async (req, res) => {
  const { name, pass } = req.body;
  try {
    if (!name || !pass) {
      return res.status(400).json({ msg: "Pls fill all fields" });
    }
    let User = await user.findOne({ name, pass });
    if (!User) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    res.status(200).json({ msg: "Success", userid: User._id });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});
app.delete("/api/doctor/deleteAppointment/:id", async (req, res) => {
  try {
    const appointmentId = req.params.id;
    console.log(`Attempting to delete appointment with ID: ${appointmentId}`);

    // Suppression du rendez-vous
    const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);
    
    // Log de l'objet supprimé
    console.log(`Deleted Appointment: ${deletedAppointment}`);

    // Si aucun rendez-vous n'est trouvé
    if (!deletedAppointment) {
      console.log('Appointment not found');
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Réponse de succès
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    // En cas d'erreur
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
});

// Fetch doctors by category
app.get("/api/user/getDoc_byCategory/:category", async (req, res) => {
  const { category } = req.params;
  try {
    if (!category) {
      return res.status(400).json({ msg: "Pls fill all fields" });
    }
    const doctors = await doctor.find({ speciality: category });
    if (doctors.length === 0) {
      return res.status(400).json({ msg: "No doctors found in this category" });
    }
    res.status(200).json({ msg: doctors });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Fetch appointments by patient ID and status "booked"
app.get("/api/user/getAppointments_byPatientId/:pat_id", async (req, res) => {
  const { pat_id } = req.params;
  try {
    if (!pat_id) {
      return res.status(400).json({ msg: "Pls fill all fields" });
    }
    const appointments = await appointment.find({ pat_id, status: "booked" });
    if (appointments.length === 0) {
      return res.status(400).json({ msg: "No appointments yet !!" });
    }
    res.status(200).json({ msg: appointments });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});
app.get("/api/user/:id", async (req, res) => {
  const { id: userId } = req.params; 

  try {
    const use = await user.findById(userId); // Cherche l'utilisateur par son ID
    if (!use) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }
    res.json(use); // Renvoie les détails de l'utilisateur
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

app.get("/api/doctor/:id", async (req, res) => {
  
  try {
    const docto = await doctor.findById(req.params.id); // Cherche le docteur par son ID
    if (!docto) {
      return res.status(404).json({ msg: 'Docteur non trouvé' });
    }
    res.json(docto); // Renvoie les détails du docteur
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});
// Route for booking an appointment
app.post("/api/user/bookAppointment", async (req, res) => {
  const { pname, dname, age, disease, phone, pat_id, doc_id, spec } = req.body;
  try {
    if (!pname || !dname || !age || !disease || !phone || !pat_id || !doc_id || !spec) {
      return res.status(400).json({ msg: "Pls fill all fields" });
    }
    const newAppointment = new appointment({
      pname,
      dname,
      age,
      disease,
      phone,
      pat_id,
      doc_id,
      spec,
      status: "booked",
    });
    await newAppointment.save();
    res.status(200).json({ msg: "Success", appointment: newAppointment });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// *******************************DOCTOR*************************************//

// Login Doctor
app.post("/api/doctor/loginDoctor", async (req, res) => {
  const { name, pass } = req.body;
  try {
    if (!name || !pass) {
      return res.status(400).json({ msg: "Pls fill all fields" });
    }
    let User = await doctor.findOne({ name, pass });
    if (!User) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    res.status(200).json({ msg: "Success", userid: User._id });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Fetch appointments by doctor ID and status "booked"
app.get("/api/doctor/getAppointments_byDoctorId/:doc_id", async (req, res) => {
  const { doc_id } = req.params;
  try {
    if (!doc_id) {
      return res.status(400).json({ msg: "Pls fill all fields" });
    }
    const appointments = await appointment.find({ doc_id, status: "booked" });
    if (appointments.length === 0) {
      return res.status(400).json({ msg: "No appointments yet !!" });
    }
    res.status(200).json({ msg: appointments });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Route to update appointment status to "done" by ID
app.put("/api/doctor/updateAppointmentStatus/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    if (!_id) {
      return res.status(400).json({ msg: "Pls fill all fields" });
    }
    const appointment = await appointment.findById(_id);
    if (!appointment) {
      return res.status(400).json({ msg: "Appointment not found" });
    }
    appointment.status = "done";
    await appointment.save();
    res.status(200).json({ msg: "Success", updatedAppointment: appointment });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// *******************************CHAT*************************************//

// Route to send a message


app.get('/api/appointment/:userId/:doctorId', async (req, res) => {
  const { userId, doctorId } = req.params;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(doctorId)) {
    return res.status(400).json({ message: 'Invalid ObjectId' });
  }

  try {
    // Chercher l'utilisateur et le docteur dans la base de données
    const use = await user.findById(userId);
    const docto = await doctor.findById(doctorId);

    if (!use) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!docto) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Réponse avec les informations de l'utilisateur et du docteur
    res.json({ use, docto });
  } catch (error) {
    console.error('Error fetching user or doctor:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

const port = 5600;
app.listen(port, () => console.log(`Server is running on port: ${port}`));
