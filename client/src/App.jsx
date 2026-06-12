import { useState, useRef } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { Routes, Route } from "react-router-dom";
import SignDocument from "./SignDocument";

pdfjs.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

function App() {
  if (window.location.pathname.startsWith("/sign/")) {
  return <SignDocument />;
}

  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
const [loggedIn, setLoggedIn] = useState(false);

const [signatures, setSignatures] =
  useState([]);

  const [documents, setDocuments] = useState([]);
  const [showDocuments, setShowDocuments] =
  useState(false);
  const fileInputRef = useRef(null);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [selectedFileId, setSelectedFileId] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
const [showSignerModal, setShowSignerModal] = useState(false);
const [receivers, setReceivers] = useState([]);
const [showMultipleModal, setShowMultipleModal] = useState(false);
const [isMultipleSigners, setIsMultipleSigners] = useState(false);
const [signerName, setSignerName] = useState("");
const [receiverName, setReceiverName] = useState("");
const [receiverEmail, setReceiverEmail] = useState("");
const [receiverRole, setReceiverRole] = useState("Signer");
const [activeSigner, setActiveSigner] = useState(null);
const [expiryDate, setExpiryDate] = useState("");
const [signatureFields, setSignatureFields] = useState([]);

const [isSigned, setIsSigned] = useState(false);

const [signature, setSignature] = useState({
  x: 200,
  y: 300,

  
});

const handleMove = (e) => {
  console.log("Active Signer:", activeSigner);

  const rect =
    e.currentTarget.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (!isMultipleSigners) {
    setSignature({ x, y });
    return;
  }

  if (activeSigner) {
    console.log("Moving signer:", activeSigner);
    console.log("New position:", x, y);

   setSignatureFields((prev) =>
  prev.map((field) =>
    field.id === activeSigner
      ? { ...field, x, y }
      : field
  )
);
  }
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

setLoggedIn(true);
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

const uploadDocument = async () => {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append(
      "pdf",
      selectedFile
    );

   const res = await axios.post(
  "http://localhost:5001/api/docs/upload",
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type":
        "multipart/form-data",
    },
  }
);
console.log(res.data);
setSelectedPdf(
  `http://localhost:5001/${res.data.document.filepath}`
);

setSelectedFileId(
  res.data.document._id
);
   alert(
  "PDF Uploaded Successfully"
);

loadDocuments();

loadSignaturePosition(
  res.data.document._id
);

return res.data.document;

  } catch (error) {
    console.log(error);

    alert("Upload Failed");
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

   await updateStatus(
  selectedFileId,
  "Signed"
);

alert("Document Signed Successfully");
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
const saveReceivers = async (fileId) => {
  try {
    console.log("Signature Fields:", signatureFields);
    console.log(signatureFields);
   const receiverData = receivers.map(
  (receiver) => {
    const field = signatureFields.find(
      (f) => f.signer === receiver.name
    );

    return {
      fileId,
      name: receiver.name,
      email: receiver.email,
      role: receiver.role,
      expiryDate,
      x: field?.x || 150,
      y: field?.y || 150,
    };
  }
);

    await axios.post(
      "http://localhost:5001/api/receivers",
      receiverData
    );

    console.log("Receivers Saved");
  } catch (error) {
    console.log(error);
    alert("Failed to save receivers");
  }
};
const loadReceivers = async (fileId) => {
  try {
    const res = await axios.get(
      `http://localhost:5001/api/receivers/${fileId}`
    );

 console.log(res.data);

setSignatureFields(
  res.data.map((receiver, index) => ({
    id: Date.now() + index,
    x: receiver.x || 150,
    y: receiver.y || 150 + index * 120,
    signer: receiver.name,
  }))
);


    console.log("Receivers Loaded");
  } catch (error) {
    console.log(error);
  }
};

 if (loggedIn) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold text-cyan-400">
            SignFlow Dashboard
          </h1>

          <p className="text-gray-400 mt-2">
            Manage and sign your documents
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            setLoggedIn(false);
          }}
          className="bg-red-600 px-5 py-2 rounded-xl hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-4 mb-8">

       <label className="bg-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 cursor-pointer">
  Upload PDF

 <input
  ref={fileInputRef}
  type="file"
  accept="application/pdf"
  hidden
  onChange={(e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setShowSignerModal(true);

    e.target.value = "";
  }}
/>
</label>

   <button
 onClick={() => {
  if (showDocuments) {
    setShowDocuments(false);
  } else {
    loadDocuments();
    setShowDocuments(true);
  }
}}
  className="bg-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
>
  Load My Documents
</button>

      </div>
      

{showDocuments && (
<>
<div className="mb-8">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl"
        >
          <option value="all">All Documents</option>
          <option value="Pending">Pending</option>
          <option value="Signed">Signed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <h2 className="text-2xl font-bold mb-6">
        My Documents
      </h2>

      <div className="grid gap-4">

        {documents
          .filter((doc) =>
            statusFilter === "all"
              ? true
              : doc.status === statusFilter
          )
          .map((doc) => (
            <div
              key={doc._id}
              className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">
                  {doc.filename}
                </h3>

                <p className="text-gray-400">
                  Status: {doc.status}
                </p>
              </div>

              <div className="flex gap-3">

                <button
               onClick={() => {
  setSelectedPdf(
    `http://localhost:5001/${doc.filepath}`
  );

  setSelectedFileId(doc._id);

  setIsSigned(false);

  loadSignaturePosition(doc._id);

  loadReceivers(doc._id);
}}
                  className="bg-cyan-600 px-4 py-2 rounded-lg"
                >
                  Open
                </button>

                <button
                  onClick={() =>
                    updateStatus(doc._id, "Signed")
                  }
                  className="bg-green-600 px-4 py-2 rounded-lg"
                >
                  Sign
                </button>

                <button
                  onClick={() =>
                    updateStatus(doc._id, "Rejected")
                  }
                  className="bg-red-600 px-4 py-2 rounded-lg"
                >
                  Reject
                </button>

              </div>
            </div>
          ))}

      </div>
</>
)}
      {showSignerModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

    <div className="bg-white text-black w-[700px] rounded-3xl p-8">

      <h2 className="text-3xl font-bold text-center mb-8">
        Who will sign this document?
      </h2>

      <div className="grid grid-cols-2 gap-6">

        <div
          onClick={async () => {
  const signer = prompt(
    "Enter signer name"
  );

  if (signer) {
    setSignerName(signer);
    setIsMultipleSigners(false);

    await uploadDocument();

    setShowSignerModal(false);
  }
}}

          className="border rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-100"
        >
          <h3 className="text-2xl font-bold mb-4">
            Only Me
          </h3>

          <p>
            Sign this document yourself
          </p>
        </div>

     <div
 onClick={() => {
  setIsMultipleSigners(true);
  setShowSignerModal(false);
  setShowMultipleModal(true);
}}
  className="border rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-100"
>
  <h3 className="text-2xl font-bold mb-4">
    Several People
  </h3>

  <p>
    Invite others to sign
  </p>
</div>

      </div>

    </div>

  </div>
)}
{showMultipleModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

    <div className="bg-white text-black p-10 rounded-3xl w-[700px]">

      <h2 className="text-3xl font-bold text-center">
        Multiple Signers
      </h2>

     <div className="mt-8 space-y-4">

 <input
  type="text"
  placeholder="Full Name"
  value={receiverName}
  onChange={(e) => setReceiverName(e.target.value)}
  className="w-full border p-3 rounded-xl"
/>

 <input
  type="email"
  placeholder="Email Address"
  value={receiverEmail}
  onChange={(e) => setReceiverEmail(e.target.value)}
  className="w-full border p-3 rounded-xl"
/>

 <select
  value={receiverRole}
  onChange={(e) => setReceiverRole(e.target.value)}
  className="w-full border p-3 rounded-xl"
>
    <option>Signer</option>
    <option>Validator</option>
    <option>Witness</option>
  </select>
<button
  onClick={() => {
  setReceivers([
  ...receivers,
  {
    name: receiverName,
    email: receiverEmail,
    role: receiverRole,
  },
]);

setReceiverName("");
setReceiverEmail("");
setReceiverRole("Signer");
  }}
  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
>
  + Add Receiver
</button>
{receivers.map((receiver, index) => (
  <div
    key={index}
    className="mt-4 p-3 border rounded-xl text-left"
  >
    <p>
      <strong>Receiver {index + 1}</strong>
    </p>

    <p>Name: {receiver.name || "Not entered"}</p>

    <p>Email: {receiver.email || "Not entered"}</p>

    <p>Role: {receiver.role}</p>
  </div>
))}
</div>

<div className="mt-6 border rounded-xl p-4">

  <h3 className="font-bold text-lg mb-3">
    Expiration Date
  </h3>

  <input
    type="date"
    value={expiryDate}
    onChange={(e) =>
      setExpiryDate(e.target.value)
    }
    className="w-full border p-3 rounded-xl"
  />

</div>
<button
onClick={async () => {

  const fields = receivers.map((receiver, index) => ({
    id: Date.now() + index,
    x: 150,
    y: 150 + index * 120,
    signer: receiver.name,
  }));

  setSignatureFields(fields);

  const uploadedDoc = await uploadDocument();

  await axios.post(
    "http://localhost:5001/api/receivers",
    receivers.map((receiver, index) => ({
      fileId: uploadedDoc._id,
      name: receiver.name,
      email: receiver.email,
      role: receiver.role,
      expiryDate,
      x: 150,
      y: 150 + index * 120,
    }))
  );

  alert("Receivers Saved");

  setShowMultipleModal(false);
}}
  className="mt-6 mr-4 bg-green-600 text-white px-6 py-2 rounded-xl"
>
  Apply
</button>
<button
  onClick={() => setShowMultipleModal(false)}
        className="mt-6 bg-red-500 text-white px-6 py-2 rounded-xl"
      >
        Close
      </button>

    </div>

  </div>
)}
      {selectedPdf && (
  <div className="mt-10 flex gap-6">
    <button
onClick={() => {
  setSelectedPdf("");
  setSelectedFile(null);

  setReceivers([]);
  setReceiverName("");
  setReceiverEmail("");
  setReceiverRole("Signer");

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
}}
  className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 h-fit"
>
  Close PDF
</button>

          <h2 className="text-2xl font-bold mb-4">
            PDF Preview
          </h2>

         <div
  onClick={(e) => {
    console.log("PDF CLICKED");
    handleMove(e);
  }}
  style={{
    position: "relative",
    display: "inline-block",
    cursor: "crosshair",
  }}
>
           <Document
  file={selectedPdf}
  onLoadSuccess={({ numPages }) =>
    setNumPages(numPages)
  }
>
  {Array.from(
    new Array(numPages),
    (el, index) => (
    <Page
  key={`page_${index + 1}`}
  pageNumber={index + 1}
  width={900}
/>
    )
  )}
</Document>

{!isMultipleSigners && (
  <div
    style={{
      position: "absolute",
      left: `${signature.x}px`,
      top: `${signature.y}px`,
      zIndex: 1000,
      fontSize: "34px",
      fontFamily: "cursive",
      color: "#444",
      cursor: "pointer",
    }}
  >
    {signerName}
  </div>
)}

{signatureFields.map((field) => (
 <div
  key={field.id}
onClick={(e) => {
  e.stopPropagation();
  setActiveSigner(field.id);
}}
 style={{
    position: "absolute",
    left: `${field.x}px`,
    top: `${field.y}px`,
    zIndex: 1000,
    border:
      activeSigner === field.id
        ? "3px solid blue"
        : "none",
  }}
>
    <div
      style={{
        background: "#f8b4b4",
        padding: "15px",
        borderRadius: "8px",
        width: "180px",
        border: "2px solid #999",
        textAlign: "center",
      }}
    >
      <p><b>✍ Signature</b></p>

      <hr />

      <p>{field.signer}</p>
    </div>
  </div>
))}
          </div>
<p>Signer: {signerName}</p>
          <p className="mt-4">
            Total Pages: {numPages}
          </p>

          <p>
            X: {Math.round(signature.x)}
            {" | "}
            Y: {Math.round(signature.y)}
          </p>
<div className="flex gap-6 mt-6">

  <div className="w-80 bg-slate-900 rounded-2xl p-6">

    <h2 className="text-2xl font-bold mb-4">
      Signing Options
    </h2>

    <p className="mb-4">
      Signer: {signerName}
    </p>

   <button
 onClick={async () => {

 if (isMultipleSigners) {
  alert("Document Sent Successfully");
} else {

    await saveSignaturePosition();

  }

  setIsSigned(true);
}}
  className="w-full bg-green-600 py-3 rounded-xl"
>
{isMultipleSigners ? "Send Document" : "Sign Document"}
</button>
{isSigned && (
  <a
    href={`http://localhost:5001/api/docs/download/${selectedFileId}`}
    target="_blank"
    rel="noreferrer"
    className="block w-full mt-4 bg-blue-600 text-center py-3 rounded-xl"
  >
    Download Signed PDF
  </a>
)}
  </div>

</div>

        </div>
      )}

    </div>
  );
}

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-10 text-white">


 <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">

  {/* LEFT SIDE */}
  <div className="space-y-8">

    <div>
      <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
        SignFlow
      </h1>

      <p className="text-2xl text-gray-300 mt-4">
        Sign Documents Securely.
        <br />
        Anytime. Anywhere.
      </p>
    </div>

    <div className="grid gap-4">

      <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
        <h3 className="font-bold text-lg">
          ⚡ Fast Digital Signatures
        </h3>
        <p className="text-gray-400 mt-2">
          Sign PDF documents in seconds.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
        <h3 className="font-bold text-lg">
          🔒 Secure & Reliable
        </h3>
        <p className="text-gray-400 mt-2">
          Your documents stay protected.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
        <h3 className="font-bold text-lg">
          ☁️ Access Anywhere
        </h3>
        <p className="text-gray-400 mt-2">
          Access documents from any device.
        </p>
      </div>

    </div>

  </div>

  {/* RIGHT SIDE */}
  <div className="max-w-md mx-auto w-full bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">

    <div className="flex mb-8">

      <button
        onClick={() => setIsLogin(true)}
        className={`flex-1 py-3 rounded-l-xl font-semibold ${
          isLogin ? "bg-blue-600" : "bg-gray-700"
        }`}
      >
        Login
      </button>

      <button
        onClick={() => setIsLogin(false)}
        className={`flex-1 py-3 rounded-r-xl font-semibold ${
          !isLogin ? "bg-blue-600" : "bg-gray-700"
        }`}
      >
        Sign Up
      </button>

    </div>

    {isLogin ? (

      <div>

        <h2 className="text-3xl font-bold mb-6">
          Welcome Back
        </h2>

        <input
          className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 mb-4"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 mb-6"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={loginUser}
          className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold"
        >
          Login
        </button>

      </div>

    ) : (

      <div>

        <h2 className="text-3xl font-bold mb-6">
          Create Account
        </h2>

        <input
          className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 mb-4"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 mb-4"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 mb-6"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={registerUser}
          className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-xl font-bold"
        >
          Create Account
        </button>

      </div>

    )}

  </div>

</div>
    </div>
  );
}

export default App;