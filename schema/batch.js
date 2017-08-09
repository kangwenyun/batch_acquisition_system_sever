    exports.addbatch =
    {
        type: "object",
        properties: {
            batchid: { type: "string", required: true },
            batchsum: { type: "string", required: true }
        }
    }
    exports.unaccepttoacceptBatch =
    {
        type: "object",
        properties: {
            batchid: { type: "string", required: true }
            
        }
    }
    exports.url="123456"
    exports.accepttocheckBatch =
    {
        type: "object",
        properties: {
            batchid: { type: "string", required: true }
           
        }
    }
    exports.checktofinishBatch =
    {
        type: "object",
        properties: {
            batchid: { type: "string", required: true }
            
        }
    }
    exports.checktoacceptBath =
    {
        type: "object",
        properties: {
            batchid: { type: "string", required: true }
            
        }
    }
    exports.getbatchInformation =
    {
        type: "object",
        properties: {
            batchid: { type: "string", required: true }
        
        }
    }
    exports.getBatchDetialThroughBatchid =
    {
        type: "object",
        properties: {
            batchid: { type: "string", required: true }
           
        }
    }
