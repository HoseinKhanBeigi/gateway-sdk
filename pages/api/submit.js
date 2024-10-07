export const config = {
  api: {
    externalResolver: true,
  },
};

let storedData = {}; // Store the data for access by the React component

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).send("OK");
  }

  if (req.method === "POST") {
    const { kycId, token } = req.body; // Extract data from request body

    storedData = { kycId, token }; // Store data globally

    return res.status(200).json({
      message: "Data received and stored.",
    });
  }

  if (req.method === "GET") {
    return res.status(200).json(storedData); // Return stored data
  }

  return res.status(405).json({ message: "Method not allowed" });
}
