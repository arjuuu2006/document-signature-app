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
  const [numPages, setNumPages] = useState(null);

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
      alert(error.response?.data?.message || "Registration Failed");
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

      localStorage.setItem("token", res.data.token);

      alert("Login Successful");
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
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

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Document Signature App</h1>

      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Go to Register" : "Go to Login"}
      </button>

      {isLogin ? (
        <div>
          <h2>Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <br />
          <br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <br />
          <br />

          <button onClick={loginUser}>Login</button>

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
                onClick={() =>
                  setSelectedPdf(
                    `http://localhost:5001/${doc.filepath}`
                  )
                }
              >
                {doc.filename}
              </button>
            </div>
          ))}

          <br />

          {selectedPdf && (
            <div>
              <h2>PDF Preview</h2>

              <Document
                file={selectedPdf}
                onLoadSuccess={({ numPages }) =>
                  setNumPages(numPages)
                }
              >
                <Page pageNumber={1} />
              </Document>

              <p>Total Pages: {numPages}</p>
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
            onChange={(e) => setName(e.target.value)}
          />

          <br />
          <br />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <br />
          <br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <br />
          <br />

          <button onClick={registerUser}>
            Register
          </button>
        </div>
      )}
    </div>
  );
}

export default App;