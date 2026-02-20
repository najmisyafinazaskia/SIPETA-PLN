const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { verifyToken } = require('../middleware/auth');

// Get all kabupaten/kota
router.get('/kabupaten-kota', locationController.getKabupatenKota);

// Get kecamatan by kabupaten/kota
router.get('/kecamatan/:kabupatenKota', locationController.getKecamatan);

// Get desa by kabupaten/kota and kecamatan
router.get('/desa/:kabupatenKota/:kecamatan', locationController.getDesa);

// Get all locations with optional filters
router.get('/all', locationController.getAllLocations);

// Get location statistics
router.get('/stats', locationController.getLocationStats);

// Get location hierarchy
router.get('/hierarchy', locationController.getHierarchy);

// Get summary of all UP3s
router.get('/up3/stats', locationController.getUp3Stats);

// New UP3 specialized endpoints from migrate
router.get('/up3/office', locationController.getUp3Offices);
router.get('/up3/desa-grouped', locationController.getUp3DesaGrouped);

// New ULP specialized endpoints
router.get('/ulp/office', locationController.getUlpOffices);
router.get('/ulp/desa-grouped', locationController.getUlpDesaGrouped);
router.get('/ulp/detail/:name', locationController.getUlpDetail);

// Get UP3 detail (kecamatan list)
router.get('/up3/detail/:name', locationController.getUp3Detail);

// Search location by name (for RegionDetailPage)
router.get('/search/:name', locationController.getLocationByName);

// Global search for any region part
router.get('/search', locationController.globalSearch);

// Map Data
router.get('/map/geojson', locationController.getGeoJSON);
router.get('/map/kecamatan-points', locationController.getKecamatanPoints);
router.get('/map/boundaries', locationController.getBoundaries);
router.get('/map/point-detail/:id', locationController.getLocationPointDetail);

// Get single location by ID
router.get('/:id', locationController.getLocationById);

// Update Dusun Status
router.put('/dusun/update-status', verifyToken, locationController.updateDusunStatus);

// Update Pelanggan count for UP3/ULP
router.put('/up3/update-pelanggan', verifyToken, locationController.updateUp3Pelanggan);
router.put('/ulp/update-pelanggan', verifyToken, locationController.updateUlpPelanggan);

module.exports = router;
