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

    const loadSignaturePosition = async (fileId) => {
  try {
    const res = await axios.get(
      `http://localhost:5001/api/signatures/${fileId}`
    );

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

    alert("Signature Position Saved");
  } catch (error) {
    console.log(error);
    alert("Failed to Save Position");
  }
};
const loadSignaturePosition = async (fileId) => {
  try {
    const res = await axios.get(
      `http://localhost:5001/api/signatures/${fileId}`
    );

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
    <div
      style={{
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1>Document Signature App</h1>

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
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <br />
          <br />

          <button onClick={loginUser}>
            Login
          </button>

          <br />
          <br />

          <button onClick={loadDocuments}>
            Load My Documents
          </button>

          <br />
          <br />

          {documents.map((doc) => (
            <div key={doc._id}>
              <button
    onClick={() => {
  setSelectedPdf(
    `http://localhost:5001/${doc.filepath}`
  );

  setSelectedFileId(doc._id);

  loadSignaturePosition(doc._id);
}}
              >
                {doc.filename}
              </button>
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
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <br />
          <br />

          <input
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
            onClick={registerUser}
          >
            Register
          </button>
        </div>
      )}
    </div>
  );
}

export default App;