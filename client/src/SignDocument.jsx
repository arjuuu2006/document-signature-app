
import { useEffect, useState } from "react";
import axios from "axios";

function SignDocument() {

  const fileId =
    window.location.pathname.split("/sign/")[1];

  console.log("FILE ID:", fileId);

  const [document, setDocument] = useState(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/docs/file/${fileId}`
        );

        setDocument(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    loadDocument();
  }, [fileId]);

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-10 rounded-2xl text-center">
       <h1 className="text-3xl font-bold mb-4">
  TEST 12345
</h1>
        <p className="mb-4">
          File: {document.filename}
        </p>

        <a
          href={`http://localhost:5001/${document.filepath}`}
          target="_blank"
          rel="noreferrer"
          className="bg-cyan-600 px-6 py-3 rounded-xl"
        >
          Open PDF
        </a>
      </div>
    </div>
  );
}

export default SignDocument;