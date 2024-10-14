import mongoose from "mongoose";

mongoose.connect('mongodb://localhost/doctor_appointment');

//--------------------Schema for User Table---------------------//
const appointment_table = new mongoose.Schema({
    pname: String,
    dname: String,
    age: String,
    disease: String,
    phone: String,
    pat_id: String,
    doc_id: String,
    spec: String,
    status: String,
    appointmentDate: Date, // Champ pour la date et l'heure du rendez-vous
});  

export default mongoose.model("appointment", appointment_table);
