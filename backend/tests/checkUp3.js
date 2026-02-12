const { getUp3Stats } = require('./controllers/locationController');
const Location = require('./models/Location');
const mongoose = require('mongoose');

// Mock req and res
const req = {};
const res = {
    json: (data) => console.log(JSON.stringify(data, null, 2)),
    status: (code) => ({ json: (data) => console.log(`Error ${code}:`, data) })
};

// Check definitions
const UP3_TO_KABUPATEN = {
    "UP3 Banda Aceh": ["KOTA BANDA ACEH", "ACEH BESAR", "KOTA SABANG"],
    "UP3 Langsa": ["KOTA LANGSA", "ACEH TIMUR", "ACEH TAMIANG"],
    "UP3 Sigli": ["PIDIE", "PIDIE JAYA"],
    "UP3 Lhokseumawe": ["KOTA LHOKSEUMAWE", "ACEH UTARA", "BIREUEN"],
    "UP3 Meulaboh": ["ACEH BARAT", "NAGAN RAYA", "ACEH JAYA", "SIMEULUE"],
    "UP3 Subulussalam": ["KOTA SUBULUSSALAM", "ACEH SINGKIL", "ACEH SELATAN", "ACEH BARAT DAYA"],
    "UP3 Takengon": ["ACEH TENGAH", "BENER MERIAH", "GAYO LUES", "ACEH TENGGARA"]
};

console.log("Checking UP3 Definitions:");
console.log(UP3_TO_KABUPATEN);
console.log("Has Takengon?", "UP3 Takengon" in UP3_TO_KABUPATEN);
