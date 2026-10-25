import React, { useState } from 'react';
import {
  Download,
  X,
  Check,
  FileArchive,
  Globe,
  ExternalLink,
  Copy,
  Server,
  Cloud,
  Rocket,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'hosting' | 'download'>('hosting');
  const [downloading, setDownloading] = useState<'standard' | 'uncompressed' | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  if (!isOpen) return null;

  const publicLiveUrl = 'https://ais-pre-7ftbyueytc7ogkfffgaehl-569317843647.europe-west3.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLiveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCommand = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(key);
    setTimeout(() => setCopiedCommand(null), 3000);
  };

  const handleBlobDownload = async (url: string, filename: string, type: 'standard' | 'uncompressed') => {
    setDownloading(type);
    setDownloadSuccess(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch {
      window.location.href = url;
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#C9A15B] shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#59172F] text-[#FFF9F2] flex items-center justify-center shrink-0">
              <Rocket className="w-6 h-6 text-[#C9A15B]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C9A15B] block">
                Comfy’s Glow Deployment Suite
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#59172F]">
                Host Online & Download Code
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#FAF5EE] p-1 border border-[#E8DCDE]">
          <button
            type="button"
            onClick={() => setActiveTab('hosting')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'hosting'
                ? 'bg-[#59172F] text-[#FFF9F2] shadow-sm'
                : 'text-[#59172F] hover:bg-white/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#C9A15B]" />
            <span>How to Host (Free & Live)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'download'
                ? 'bg-[#59172F] text-[#FFF9F2] shadow-sm'
                : 'text-[#59172F] hover:bg-white/60'
            }`}
          >
            <FileArchive className="w-3.5 h-3.5 text-[#C9A15B]" />
            <span>Download Project ZIP</span>
          </button>
        </div>

        {/* TAB 1: HOSTING GUIDE */}
        {activeTab === 'hosting' && (
          <div className="space-y-4">
            {/* Live Link Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF9F2] to-[#FAF5EE] border-2 border-[#C9A15B] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-serif text-sm font-bold text-[#59172F]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Your Website Is Already Live Right Now!
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Active 24/7 Cloud
                </span>
              </div>
              <p className="text-xs text-[#5D5560] leading-relaxed">
                This project is running on high-speed Google Cloud with automated HTTPS SSL. You can share this link immediately with customers, team members, or clients:
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-white border border-[#C9A15B]/50 rounded-xl text-xs font-mono text-slate-800 truncate select-all">
                  {publicLiveUrl}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C9A15B]" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={publicLiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Live Store</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Providers Grid */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#59172F] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#C9A15B]" />
                Deploy Under Your Own Domain (Completely Free)
              </h4>

              {/* Provider 1: Vercel */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#C9A15B] transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center text-[11px] font-black">▲</span>
                    <strong className="text-xs font-bold text-slate-800">Option A: Vercel (Fastest & Free Custom Domain)</strong>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">60 Seconds</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  1. Download the ZIP file below, extract it, and push to GitHub (or drag into Vercel CLI).<br />
                  2. Visit <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-[#59172F] font-bold underline">vercel.com/new</a> and select your repository.<br />
                  3. Build settings are auto-detected (<code>npm run build</code>, directory: <code>dist</code>). <code>vercel.json</code> is already configured.<br />
                  4. Click <strong>Deploy</strong>. You can connect your custom domain (e.g., <code>comfysglow.com</code>) with free SSL!
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-slate-500">Preset: Vite React SPA</span>
                  <a
                    href="https://vercel.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#59172F] hover:text-[#C9A15B] flex items-center gap-1"
                  >
                    <span>Deploy on Vercel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Provider 2: Netlify Drop */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#C9A15B] transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-[11px] font-black">N</span>
                    <strong className="text-xs font-bold text-slate-800">Option B: Netlify Drop (Zero Code Drag-and-Drop)</strong>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">No Git Needed</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  1. Run <code>npm run build</code> in your downloaded folder (generates the <code>dist/</code> folder).<br />
                  2. Open <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-[#59172F] font-bold underline">app.netlify.com/drop</a> in your web browser.<br />
                  3. Drag and drop the <code>dist/</code> folder right onto the page. Your site is live instantly!
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-slate-500">Redirects: public/_redirects included</span>
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#59172F] hover:text-[#C9A15B] flex items-center gap-1"
                  >
                    <span>Open Netlify Drop</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Provider 3: Full-Stack Node.js (Render / Railway / DigitalOcean) */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#C9A15B] transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-indigo-600" />
                    <strong className="text-xs font-bold text-slate-800">Option C: Full-Stack Node.js (Render / Railway / VPS)</strong>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Express API</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  If you want to host both the client store and the Express backend (<code>server.ts</code>):<br />
                  • Build Command: <code className="bg-slate-100 px-1 py-0.5 rounded">npm install && npm run build</code><br />
                  • Start Command: <code className="bg-slate-100 px-1 py-0.5 rounded">npm start</code><br />
                  • Port Environment Variable: <code className="bg-slate-100 px-1 py-0.5 rounded">PORT=3000</code>
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyCommand('npm install && npm run build && npm start', 'fullstack')}
                    className="text-xs font-bold text-[#59172F] hover:text-[#C9A15B] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCommand === 'fullstack' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCommand === 'fullstack' ? 'Copied Commands!' : 'Copy Build & Start Command'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOWNLOAD ARCHIVES */}
        {activeTab === 'download' && (
          <div className="space-y-4">
            {downloadSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Download Started!</strong> Check your computer&rsquo;s &ldquo;Downloads&rdquo; folder for{' '}
                  <code>{downloadSuccess}</code>.
                </span>
              </div>
            )}

            {/* Format Options */}
            <div className="space-y-3.5">
              {/* Option 1: Windows Native Standard ZIP */}
              <div className="p-4 rounded-2xl bg-[#FFF9F2] border-2 border-[#C9A15B] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[#59172F] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Windows Compatible ZIP (Recommended for Windows)
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    4.65 MB
                  </span>
                </div>
                <p className="text-xs text-[#5D5560] leading-relaxed">
                  Engineered with native MS-DOS FAT archive attributes. Right-click and choose <em>&ldquo;Extract All...&rdquo;</em> in Windows File Explorer without any compression warnings or third-party tools.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBlobDownload('/comfys-glow-windows.zip', 'comfys-glow-windows.zip', 'standard')}
                    disabled={downloading !== null}
                    className="flex-1 py-2.5 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#C9A15B]" />
                    <span>{downloading === 'standard' ? 'Downloading...' : 'Download Windows ZIP'}</span>
                  </button>
                  <a
                    href="/comfys-glow-windows.zip"
                    download="comfys-glow-windows.zip"
                    className="px-3 py-2.5 bg-[#FFF9F2] hover:bg-[#F3E8D7] border border-[#C9A15B] text-[#59172F] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                    title="Direct Browser Download"
                  >
                    Direct
                  </a>
                </div>
              </div>

              {/* Option 2: Universal Standard ZIP */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#C9A15B]/40 hover:border-[#C9A15B] transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[#59172F]">
                    Universal ZIP (All Platforms / macOS / Linux)
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    4.65 MB
                  </span>
                </div>
                <p className="text-xs text-[#5D5560] leading-relaxed">
                  Standard DEFLATE ZIP with top-level <code>comfys-glow/</code> folder. Works natively in macOS Finder, Linux, Android, iOS, and 7-Zip/WinRAR.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBlobDownload('/comfys-glow-project.zip', 'comfys-glow-project.zip', 'standard')}
                    disabled={downloading !== null}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-[#FFF9F2] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#C9A15B]" />
                    <span>Download Universal ZIP</span>
                  </button>
                  <a
                    href="/comfys-glow-project.zip"
                    download="comfys-glow-project.zip"
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                    title="Direct Browser Download"
                  >
                    Direct
                  </a>
                </div>
              </div>

              {/* Option 3: Tarball (.tar.gz) & Uncompressed Store */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>Gzip Tarball (.tar.gz)</span>
                    <span className="text-[10px] text-slate-500 font-mono">4.65 MB</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Universal for Mac, Linux, and Windows 10/11 <code>tar -xzf</code> command.</p>
                  <a
                    href="/comfys-glow-project.tar.gz"
                    download="comfys-glow-project.tar.gz"
                    className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .tar.gz
                  </a>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>Uncompressed ZIP (Store)</span>
                    <span className="text-[10px] text-slate-500 font-mono">5.01 MB</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Pure uncompressed container format. Zero decompression algorithms required.</p>
                  <a
                    href="/comfys-glow-uncompressed.zip"
                    download="comfys-glow-uncompressed.zip"
                    className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Store ZIP
                  </a>
                </div>
              </div>
            </div>

            {/* How to run locally */}
            <div className="bg-[#FAF5EE] p-4 rounded-2xl border border-[#E8DCDE] text-xs space-y-2">
              <span className="font-bold text-[#59172F] flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[#C9A15B]" />
                How to Run Locally on Your Computer:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[#5D5560]">
                <li>Extract the downloaded ZIP folder to your desktop.</li>
                <li>Open your terminal or command prompt inside the folder.</li>
                <li>Run <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">npm install</code> to install dependencies.</li>
                <li>Run <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">npm run dev</code> to start the local development server.</li>
                <li>Open <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">http://localhost:3000</code> in your browser!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3 gap-2">
          <span>Comfy’s Glow Atelier · Production-Ready Codebase</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(activeTab === 'hosting' ? 'download' : 'hosting')}
              className="text-[#59172F] font-bold hover:underline cursor-pointer"
            >
              {activeTab === 'hosting' ? 'Switch to Download ZIP' : 'Switch to Hosting Guide'}
            </button>
            <span>•</span>
            <button onClick={onClose} className="hover:text-slate-600 font-semibold cursor-pointer">
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
