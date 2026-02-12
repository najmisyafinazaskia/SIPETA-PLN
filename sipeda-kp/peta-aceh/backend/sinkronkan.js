const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/db_aceh');

const Desa = mongoose.model('Desa', new mongoose.Schema({ name: String, geometry: Object }));
const PlnStatus = mongoose.model('PlnStatus', new mongoose.Schema({ 
  kabupaten: String, kecamatan: String, nama_desa: String, status_listrik: String 
}));

app.get('/api/peta-pln', async (req, res) => {
  try {
    const dataPeta = await Desa.find().lean();
    const dataExcel = await PlnStatus.find().lean();

    const excelMap = {};
    dataExcel.forEach(ex => {
      if (ex.nama_desa) excelMap[ex.nama_desa.toUpperCase()] = ex;
    });

    const features = dataPeta.map(p => {
      const info = excelMap[(p.name || "").toUpperCase()];
      return {
        type: "Feature",
        properties: {
          name: info ? info.nama_desa : p.name,
          status: info ? info.status_listrik : "Belum Terdata",
          kecamatan: info ? info.kecamatan : "-",
          kabupaten: info ? info.kabupaten : "-"
        },
        geometry: p.geometry
      };
    });

    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('🚀 Server Berjalan di Port 5000'));