interface CenteredModalProps {
  children: React.ReactNode;
}

export default function CenteredModal({ children }: CenteredModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      style={{ margin: 0 }}
    >
      <div className="bg-gray-800 p-8 rounded-xl text-center max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
}
