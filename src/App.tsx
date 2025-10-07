import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsPanel } from './components/SettingsPanel';
import { PromptInput } from './components/PromptInput';
import { MediaUpload } from './components/MediaUpload';
import { Gallery } from './components/Gallery';
import { GenerationModes } from './components/GenerationModes';
import { QueueView } from './components/QueueView';
import { Button } from './components/ui/Button';
import { ToastContainer } from './components/ui/Toast';
import { useQueue } from './hooks/useQueue';
import { saveGenerationsToStorage, loadGenerationsFromStorage } from './lib/storage';
import type {
  GenerationMode,
  GenerationSettings,
  MediaFile,
  SavedGeneration,
} from './types/sora';

type View = 'create' | 'queue' | 'gallery';

function App() {
  const [view, setView] = useState<View>('create');
  const [mode, setMode] = useState<GenerationMode>('text');
  const [prompt, setPrompt] = useState('');
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>({
    width: 1280,
    height: 720,
    duration: 10,
    nVariants: 1,
    aspectRatio: 'landscape',
    movementPreset: 'none',
    maxDuration: 15, // 1280x720 max
  });

  const [savedGenerations, setSavedGenerations] = useState<SavedGeneration[]>([]);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Queue manager
  const { queuedJobs, addToQueue, removeFromQueue, clearCompleted } = useQueue({
    onJobComplete: (generation) => {
      setSavedGenerations((prev) => [generation, ...prev]);
    },
    onToast: addToast,
  });

  // Load generations from localStorage on mount
  useEffect(() => {
    const loadStoredGenerations = () => {
      try {
        const stored = loadGenerationsFromStorage();
        setSavedGenerations(stored);
        if (stored.length > 0) {
          console.log(`Loaded ${stored.length} generations from storage`);
        }
      } catch (error) {
        console.error('Failed to load stored generations:', error);
        addToast('Failed to load saved videos', 'error');
      } finally {
        setIsLoadingStorage(false);
      }
    };

    loadStoredGenerations();
  }, []);

  // Save generations to localStorage whenever they change
  useEffect(() => {
    // Skip saving on initial load
    if (isLoadingStorage) {
      return;
    }

    const saveToStorage = () => {
      try {
        saveGenerationsToStorage(savedGenerations);
        console.log(`Saved ${savedGenerations.length} generations to storage`);
      } catch (error) {
        console.error('Failed to save generations:', error);
        addToast('Failed to save videos to storage', 'error');
      }
    };

    // Debounce saves to avoid excessive writes
    const timeoutId = setTimeout(saveToStorage, 500);
    return () => clearTimeout(timeoutId);
  }, [savedGenerations, isLoadingStorage]);

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) {
      addToast('Please enter a prompt', 'error');
      return;
    }

    if ((mode === 'image' || mode === 'video') && !mediaFile) {
      addToast(`Please upload ${mode === 'image' ? 'an image' : 'a video'}`, 'error');
      return;
    }

    // Add to queue instead of generating directly
    addToQueue(prompt, settings, mode, mediaFile || undefined);

    // Clear form
    setPrompt('');
    setMediaFile(null);

    // Switch to queue view
    setView('queue');
  }, [prompt, mode, mediaFile, settings, addToQueue]);

  const handleSelectGeneration = (generation: SavedGeneration) => {
    setPrompt(generation.prompt);
    setSettings(generation.settings);
    setMode(generation.mode);
    setView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteGeneration = (id: string) => {
    setSavedGenerations((prev) => {
      const generationToDelete = prev.find((gen) => gen.id === id);

      // Clean up blob URL to prevent memory leaks
      if (generationToDelete?.videoUrl && generationToDelete.videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(generationToDelete.videoUrl);
      }

      return prev.filter((gen) => gen.id !== id);
    });
    addToast('Generation deleted', 'info');
  };

  const handleDownloadVideo = useCallback((videoBlob: Blob, prompt: string) => {
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sora-${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Video downloaded!', 'success');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-100 via-sage-50 to-forest-50">
      {/* Background Image */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560')] bg-cover bg-center blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/20 backdrop-blur-md bg-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-sage-800">Sora Video Generation</h1>
              <div className="flex gap-3">
                <Button
                  variant={view === 'create' ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => setView('create')}
                >
                  Create
                </Button>
                <Button
                  variant={view === 'queue' ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => setView('queue')}
                  className="relative"
                >
                  Queue
                  {queuedJobs.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {queuedJobs.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant={view === 'gallery' ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => setView('gallery')}
                >
                  Gallery
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {view === 'create' ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Generation Modes */}
                <div className="flex justify-center">
                  <GenerationModes mode={mode} onChange={setMode} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Prompt Input */}
                    <PromptInput
                      value={prompt}
                      onChange={setPrompt}
                      onGenerate={handleGenerate}
                      isGenerating={false}
                    />

                    {/* Media Upload */}
                    {(mode === 'image' || mode === 'video') && (
                      <MediaUpload
                        mediaFile={mediaFile}
                        onMediaChange={setMediaFile}
                        accept={mode}
                        maxDuration={settings.duration}
                      />
                    )}
                  </div>

                  {/* Right Column - Settings */}
                  <div>
                    <SettingsPanel settings={settings} onSettingsChange={setSettings} />
                  </div>
                </div>
              </motion.div>
            ) : view === 'queue' ? (
              <motion.div
                key="queue"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold text-sage-800 mb-6">Generation Queue</h2>
                <QueueView
                  jobs={queuedJobs}
                  onRemove={removeFromQueue}
                  onClearCompleted={clearCompleted}
                />
              </motion.div>
            ) : (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold text-sage-800 mb-6">Your Generations</h2>
                <Gallery
                  generations={savedGenerations}
                  onSelect={handleSelectGeneration}
                  onDelete={handleDeleteGeneration}
                  onDownload={handleDownloadVideo}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
