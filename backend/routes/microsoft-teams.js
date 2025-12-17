const express = require('express');
const router = express.Router();
const MicrosoftTeamsIntegration = require('../integrations/microsoft-teams');

const getTeams = (req) => new MicrosoftTeamsIntegration({
  accessToken: req.body.accessToken || req.headers['x-ms-teams-access-token']
});

router.get('/teams', async (req, res) => {
  try {
    const teams = getTeams(req);
    const result = await teams.getTeams();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/teams/:teamId', async (req, res) => {
  try {
    const teams = getTeams(req);
    const result = await teams.getTeam(req.params.teamId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/teams/:teamId/channels', async (req, res) => {
  try {
    const teams = getTeams(req);
    const result = await teams.getChannels(req.params.teamId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/teams/:teamId/channels', async (req, res) => {
  try {
    const { displayName, description } = req.body;
    const teams = getTeams(req);
    const result = await teams.createChannel(req.params.teamId, displayName, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/teams/:teamId/channels/:channelId/messages', async (req, res) => {
  try {
    const teams = getTeams(req);
    const result = await teams.getMessages(req.params.teamId, req.params.channelId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/teams/:teamId/channels/:channelId/messages', async (req, res) => {
  try {
    const { content } = req.body;
    const teams = getTeams(req);
    const result = await teams.sendMessage(req.params.teamId, req.params.channelId, content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/teams/:teamId/channels/:channelId/messages/:messageId/replies', async (req, res) => {
  try {
    const { content } = req.body;
    const teams = getTeams(req);
    const result = await teams.replyToMessage(
      req.params.teamId,
      req.params.channelId,
      req.params.messageId,
      content
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/teams/:teamId/members', async (req, res) => {
  try {
    const teams = getTeams(req);
    const result = await teams.getMembers(req.params.teamId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/teams/:teamId/members', async (req, res) => {
  try {
    const { userId, roles } = req.body;
    const teams = getTeams(req);
    const result = await teams.addMember(req.params.teamId, userId, roles);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/teams/:teamId/members/:membershipId', async (req, res) => {
  try {
    const teams = getTeams(req);
    const result = await teams.removeMember(req.params.teamId, req.params.membershipId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/teams/:teamId/channels/:channelId/tabs', async (req, res) => {
  try {
    const teams = getTeams(req);
    const result = await teams.getTabs(req.params.teamId, req.params.channelId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/teams/:teamId/channels/:channelId/tabs', async (req, res) => {
  try {
    const { displayName, teamsAppId, configuration } = req.body;
    const teams = getTeams(req);
    const result = await teams.createTab(
      req.params.teamId,
      req.params.channelId,
      displayName,
      teamsAppId,
      configuration
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/meetings', async (req, res) => {
  try {
    const { subject, startDateTime, endDateTime, participants } = req.body;
    const teams = getTeams(req);
    const result = await teams.scheduleOnlineMeeting(subject, startDateTime, endDateTime, participants);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/meetings', async (req, res) => {
  try {
    const teams = getTeams(req);
    const result = await teams.getOnlineMeetings();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/calendar/events', async (req, res) => {
  try {
    const teams = getTeams(req);
    const result = await teams.getCalendarEvents();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
