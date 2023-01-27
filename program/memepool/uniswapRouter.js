const ethers = require("ethers");

const decoder = ethers.utils.AbiCoder();

const input_decoder = {
  V3_SWAP_EXACT_IN: ["address", "uint256", "uint256", "bytes", "bool"],
  V3_SWAP_EXACT_OUT: ["address", "uint256", "uint256", "bytes", "bool"],
  V2_SWAP_EXACT_IN: ["address", "uint256", "uint256", "address []", "bool"],
  V2_SWAP_EXACT_OUT: ["address", "uint256", "uint256", "address []", "bool"],
};

const code = {
  V3_SWAP_EXACT_IN: "00",
  V3_SWAP_EXACT_OUT: "01",
  V2_SWAP_EXACT_IN: "08",
  V2_SWAP_EXACT_OUT: "09",
};

const input_code = {
  V3_SWAP_EXACT_IN,
  V3_SWAP_EXACT_OUT,
  V2_SWAP_EXACT_IN,
  V2_SWAP_EXACT_OUT,
};

const decodeInputs = (input_code_name) => {
  return decoder.decode(code[input_code_name], input_decoder[input_code_name]);
};

const decodeCode = (num) => {
  switch (num) {
    case "00":
      return input_code.V3_SWAP_EXACT_IN;
    case "01":
      return input_code.V3_SWAP_EXACT_OUT;
    case "08":
      return input_code.V2_SWAP_EXACT_IN;
    case "09":
      return input_code.V2_SWAP_EXACT_OUT;
    default:
      return null;
  }
};

module.exports = {
  decodeInputs,
  decodeCode,
  code,
  input_decoder,
};
