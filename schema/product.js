  
  //userid预留一下
   exports.QaddDataWhileRefreshBatch2 =
    {
        type: "object",
        properties: {
            productid: { type: "string", required: true },
            batchid: { type: "string", required: true },
            type_length: { type: "string", required: true },
            type_high: { type: "string", required: true },
            type_width: { type: "string", required: true },
            tray: { type: "string", required: true },
            flag: { type: "string", required: true },
        }
    }
        exports.QdeleteDataWhileRefreshBatch =
    {
        type: "object",
        properties: {
            batchid: { type: "string", required: true },
            productid: { type: "string", required: true }
        }
    }

        exports.changeproduct =
    {
        type: "object",
        properties: {
            productid: { type: "string", required: true },
             batchid: { type: "string", required: true },
              number: { type: "number", required: true },
               type_length: { type: "string", required: true },
                type_high: { type: "string", required: true },
                 type_width: { type: "string", required: true },
                  tray: { type: "string", required: true },
                   time: { type: "string", required: true },
                   flag: { type: "string", required: true }
        }
    }
        exports.getproductthroughproductid =
    {
        type: "object",
        properties: {
            productid: { type: "string", required: true }
        }
    }
        exports.search =
    {
        type: "object",
        properties: {
            productid: { type: "string", required: true }
        }
    }
