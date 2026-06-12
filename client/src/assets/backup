import { useState } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusFilter, setStatusFilter] =
  useState("all");

const [signatures, setSignatures] =
  useState([]);

  const [documents, setDocuments] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [selectedFileId, setSelectedFileId] = useState("");
  const [numPages, setNumPages] = useState(null);

const [signature, setSignature] = useState({
  x: 200,
  y: 300,

  
});

const handleMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();

  setSignature({
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  });
};

  const registerUser = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      alert(res.data.message);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Registration Failed"
      );
    }
  };

  const loginUser = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      alert("Login Successful");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Login Failed"
      );
    }
  };

  const loadDocuments = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:5001/api/docs/my-documents",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setDocuments(res.data);
  } catch (error) {
    alert("Failed to load documents");
  }
};

const updateStatus = async (id, status) => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5001/api/docs/status/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    loadDocuments();

    alert(`Document ${status}`);
  } catch (error) {
    console.log(error);
    alert("Failed to update status");
  }
};

const saveSignaturePosition = async () => {
  try {
    await axios.post(
      "http://localhost:5001/api/signatures",
      {
        fileId: selectedFileId,
        signer: "Arjun",
        x: signature.x,
        y: signature.y,
      }
    );

    alert("Signature Position Saved");
  } catch (error) {
    console.log(error);
    alert("Failed to Save Position");
  }
};

const loadSignaturePosition = async (fileId) => {
  try {
    const res = await axios.get(
`http://localhost:5001/api/signatures/${fileId}`    );

    if (res.data.length > 0) {
      const latestSignature =
        res.data[res.data.length - 1];

      setSignature({
        x: latestSignature.x,
        y: latestSignature.y,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

 


  return (
   <div className="min-h-screen bg-slate-100 p-10 text-center">
<h1 className="text-5xl font-bold text-blue-600">
  Document Signature App
</h1>
      <button
        onClick={() =>
          setIsLogin(!isLogin)
        }
      >
        {isLogin
          ? "Go to Register"
          : "Go to Login"}
      </button>

      {isLogin ? (
        <div>
          <h2>Login</h2>
<input
  className="w-full border p-3 rounded-lg"
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) =>
    setEmail(e.target.value)
  }
/>

          <br />
          <br />

          <input
  className="w-full border p-3 rounded-lg"
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) =>
    setPassword(e.target.value)
  }
/>
          <br />
          <br />

          <button
  onClick={loginUser}
  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
>
  Login
</button>

          <br />
          <br />

         <button
  onClick={loadDocuments}
  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
>
  Load My Documents
</button>
<br />
<br />

<select
  value={statusFilter}
  onChange={(e) =>
    setStatusFilter(e.target.value)
  }
  className="border p-2 rounded-lg"
>
  <option value="all">All</option>
  <option value="Pending">Pending</option>
  <option value="Signed">Signed</option>
  <option value="Rejected">Rejected</option>
</select>

<br />
<br />
          <br />
          <br />

{documents
  .filter((doc) =>
    statusFilter === "all"
      ? true
      : doc.status === statusFilter
  )
  .map((doc) => (            <div key={doc._id}>
              <button
    onClick={() => {
  setSelectedPdf(
    `http://localhost:5001/${doc.filepath}`
  );

  setSelectedFileId(doc._id);

  loadSignaturePosition(doc._id);
}}
              >
{doc.filename} ({doc.status})              
</button>
<div className="space-x-2">
  <button
    onClick={() =>
      updateStatus(doc._id, "Signed")
    }
  >
    Sign
  </button>

  <button
    onClick={() =>
      updateStatus(doc._id, "Rejected")
    }
  >
    Reject
  </button>
</div>
            </div>
          ))}

          <br />

          {selectedPdf && (
            <div>
              <h2>PDF Preview</h2>

              <div
  onClick={handleMove}
  style={{
    position: "relative",
    display: "inline-block",
    cursor: "crosshair",
  }}
>
                <Document
                  file={selectedPdf}
                  onLoadSuccess={({
                    numPages,
                  }) =>
                    setNumPages(numPages)
                  }
                >
                  <Page pageNumber={1} />
                </Document>

                <div
                  style={{
                    position: "absolute",
                    left: `${signature.x}px`,
                    top: `${signature.y}px`,
                    backgroundColor:
                      "yellow",
                    padding: "5px 10px",
                    border:
                      "2px solid red",
                    fontWeight: "bold",
                    zIndex: 1000,
                  }}
                >
                  SIGN HERE
                </div>
              </div>

              <p>
                Total Pages: {numPages}
              </p>
              <p>
  X: {Math.round(signature.x)} | Y: {Math.round(signature.y)}
</p>
<br />

<button onClick={saveSignaturePosition}>
  Save Signature Position
</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>Register</h2>
<input
  className="w-full border p-3 rounded-lg"
  type="text"
  placeholder="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

<br />
<br />

<input
  className="w-full border p-3 rounded-lg"
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<br />
<br />

<input
  className="w-full border p-3 rounded-lg"
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

          <br />
          <br />

         <button
  onClick={registerUser}
  className="bg-purple-600 text-white px-6 py-2 rounded-lg"
>
  Register
</button>
        </div>
      )}
    </div>
  );
}

export default App;