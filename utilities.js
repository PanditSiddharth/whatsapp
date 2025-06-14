const getUserPhone = (req) =>
    req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0].from || null;

const getMessageText = (req) =>
    req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || null;
const getMessageId = (req) =>
    req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id || null;

module.exports = { getUserPhone, getMessageText, getMessageId };