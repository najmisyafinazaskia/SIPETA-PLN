const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

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

// Get single location by ID
router.get('/:id', locationController.getLocationById);

// Update Dusun Status
router.put('/dusun/update-status', locationController.updateDusunStatus);

module.exports = router;
