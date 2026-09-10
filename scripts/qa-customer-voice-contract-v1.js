"use strict";
const assert=require("assert"); const fs=require("fs"); const path=require("path"); const root=path.join(__dirname,"..");
const contract=require("../data/internal/rofo-customer-voice-v1/voice-contract.json"); const examples=require("../data/internal/rofo-customer-voice-v1/examples.json");
assert.equal(contract.principle,"INTERNAL_CONTRACT_NE_CUSTOMER_LANGUAGE"); assert.deepEqual(contract.sequence,["CONCLUSION","EXPLANATION","NEXT_QUESTION"]); assert(examples.length>=10); assert(contract.omissionRule); assert(contract.repetitionRule);
assert(!fs.existsSync(path.join(root,"_data/rofoCustomerVoiceV1.js")),"Foundation must not become a public adapter during calibration."); console.log("Customer Voice Contract v1 QA passed.");
