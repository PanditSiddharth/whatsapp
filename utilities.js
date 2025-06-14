const getUserPhone = (req) =>
    req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || null;

const getMessageText = (req) => {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return null;

    // Handle different types of messages
    if (message.text?.body) {
        return message.text.body;
    } else if (message.interactive?.type === 'button_reply') {
        return message.interactive.button_reply.title;
    } else if (message.interactive?.type === 'list_reply') {
        return message.interactive.list_reply.title;
    } else if (message.button?.text) {
        return message.button.text;
    }
    
    console.log('Message structure:', JSON.stringify(message, null, 2));
    return null;
};

const getMessageId = (req) =>
    req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id || null;

const getMessageType = (req) => {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    return message?.type || null;
};

module.exports = { getUserPhone, getMessageText, getMessageId, getMessageType };