const listService = require('../services/list.service');

const getPublic = async (req, res) => {
    try { res.json(await listService.getPublicLists()); } 
    catch (error) { res.status(500).json({ error: error.message }); }
};

const getUserLists = async (req, res) => {
    try { res.json(await listService.getUserLists(req.user.id)); } 
    catch (error) { res.status(500).json({ error: error.message }); }
};

const getById = async (req, res) => {
    try { res.json(await listService.getListById(req.params.id)); } 
    catch (error) { res.status(error.message === 'Sector not found' ? 404 : 500).json({ error: error.message }); }
};

const create = async (req, res) => {
    try { res.status(201).json(await listService.createList(req.user.id, req.body)); } 
    catch (error) { res.status(400).json({ error: error.message }); }
};

const addItem = async (req, res) => {
    try { res.status(201).json(await listService.addListItem(req.user.id, req.params.listId, req.body)); } 
    catch (error) { res.status(400).json({ error: error.message }); }
};

const removeItem = async (req, res) => {
    try { res.json(await listService.removeWatchlistItem(req.user.id, req.params.movieId)); } 
    catch (error) { res.status(500).json({ error: error.message }); }
};

const updatePoster = async (req, res) => {
    try { res.json({ message: 'Visual asset updated', list: await listService.updateListPoster(req.user.id, req.params.id, req.body.poster_url) }); } 
    catch (error) { res.status(500).json({ error: error.message }); }
};

const vote = async (req, res) => {
    try { res.json(await listService.voteOnList(Number(req.user.id), req.params.id, req.body.type)); } 
    catch (error) { res.status(error.message === 'Sector not found' ? 404 : 500).json({ error: error.message }); }
};

module.exports = { getPublic, getUserLists, getById, create, addItem, removeItem, updatePoster, vote };