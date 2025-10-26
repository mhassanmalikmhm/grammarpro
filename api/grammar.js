const response = await fetch(
  "https://patient-bread-b2c0.mhmhassanmalik.workers.dev/",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: text })
  }
);
