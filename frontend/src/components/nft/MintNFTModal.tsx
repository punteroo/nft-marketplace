import { useState, type FormEvent, useRef } from "react";

interface MintNFTModalProps {
  onMint: (file: File, name: string, description: string) => Promise<void>;
  isMinting: boolean;
}

export function MintNFTModal({ onMint, isMinting }: MintNFTModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !name || !description) return;
    await onMint(file, name, description);
    modalRef.current?.close(); // Close modal on success
  };

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => modalRef.current?.showModal()}
      >
        Create New NFT
      </button>
      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Mint a New NFT</h3>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <input
              type="text"
              placeholder="NFT Name"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              required
            />
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => modalRef.current?.close()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${isMinting && "loading"}`}
                disabled={isMinting}
              >
                Mint NFT
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
