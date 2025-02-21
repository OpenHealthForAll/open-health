export default function PrivacyNotice() {
    return (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="mb-2">
                OpenHealth is an open-source project.
                If you prefer not to share any data, you can run it locally.
            </p>
            <p className="mb-2">
                <a
                    href="https://github.com/OpenHealthForAll/open-health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                >
                    GitHub Repository
                </a>
            </p>
            <p>
                Your data will not be shared with anyone and will only be used to analyze your health concerns.
            </p>
        </div>
    );
} 