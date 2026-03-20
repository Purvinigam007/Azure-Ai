async function processDocument() {
  const endpoint = document.getElementById("endpoint").value;
  const apiKey = document.getElementById("apikey").value;
  const file = document.getElementById("fileInput").files[0];
  const url = document.getElementById("urlInput").value;

  const outputDiv = document.getElementById("output");
  const loader = document.getElementById("loader");

  outputDiv.innerHTML = "";
  loader.classList.remove("hidden");

  try {
    let response;

    if (url) {
      response = await fetch(
        endpoint + "/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2023-07-31",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": apiKey
          },
          body: JSON.stringify({ urlSource: url })
        }
      );
    } else if (file) {
      response = await fetch(
        endpoint + "/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2023-07-31",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": apiKey
          },
          body: file
        }
      );
    } else {
      alert("Upload file or enter URL");
      loader.classList.add("hidden");
      return;
    }

    const operationLocation = response.headers.get("operation-location");

    if (!operationLocation) {
      throw new Error("Invalid request or missing operation-location");
    }

    let result;

    while (true) {
      await new Promise(r => setTimeout(r, 2000));

      const pollResponse = await fetch(operationLocation, {
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey
        }
      });

      result = await pollResponse.json();

      if (result.status === "succeeded") break;
      if (result.status === "failed") throw new Error("Analysis failed");
    }

    // ✅ Clean Text Output
    let textOutput = "";

    result.analyzeResult.pages.forEach(page => {
      page.lines.forEach(line => {
        textOutput += line.content + "\n";
      });
    });

    outputDiv.innerHTML = textOutput;

  } catch (error) {
    outputDiv.innerHTML = "❌ " + error.message;
  }

  loader.classList.add("hidden");
}