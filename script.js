document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selection ---
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const resetButton = document.getElementById('reset-chat-button');
    const musicLogo = document.getElementById('music-logo');
    const popupPlayPauseButton = document.getElementById('popup-play-pause-button');
    const popupPrevButton = document.getElementById('popup-prev-button');
    const popupNextButton = document.getElementById('popup-next-button');
    const musicPlayerPopup = document.getElementById('music-player-popup');
    const closeButton = document.getElementById('close-button');
    const overlay = document.getElementById('overlay');
    const progressBar = document.getElementById('progress-bar');
    const songTitleDisplay = document.getElementById('song-title-display');
    const songTitleMarquee = document.getElementById('song-title-marquee');
    const albumArtDisplay = document.getElementById('album-art-display');
    const navLinks = document.querySelectorAll('nav .nav-link');
    const pages = document.querySelectorAll('.page');
    const loadingScreen = document.getElementById('loading-screen');
    const chatContainer = document.getElementById('chat-container');
    const whatsappButtonHome = document.getElementById('whatsapp-button');
    const whatsappButtonChat = document.getElementById('whatsapp-button-chat');
    const uploadButton = document.getElementById('upload-button');
    const imageUploadInput = document.getElementById('image-upload-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const progressBarContainer = document.querySelector('.progress-bar-container');
    const musicPlayerControls = document.getElementById('music-player-controls');

    // --- API Configuration ---
    const GEMINI_API_KEY = "AIzaSyCgL1-cotecOddG2cbZzVO0kspZ3xtOxSw"; // Ganti dengan API Key Anda jika diperlukan
    const GEMINI_MODEL = "gemini-2.0-flash"; // Model yang digunakan
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    // --- State Variables ---
    let conversationHistory = [];
    let isMusicPlaying = false;
    let currentSongIndex = 0;
    let audio = new Audio();
    let musicList = [];
    let selectedImageFile = null;
    let selectedImageBase64 = null;

    // --- UI Helper Functions ---
    function showTypingIndicator() {
        if (typingIndicator) typingIndicator.style.display = 'inline-flex';
    }

    function hideTypingIndicator() {
        if (typingIndicator) typingIndicator.style.display = 'none';
    }

    function typeMessage(message, element, callback) {
        let i = 0;
        element.textContent = '';
        const typingInterval = setInterval(() => {
            if (i < message.length) {
                element.textContent += message.charAt(i);
                i++;
                if (chatMessages) chatMessages.scrollTop = 0; // Scroll to top as message prepends
            } else {
                clearInterval(typingInterval);
                if (chatMessages) chatMessages.scrollTop = 0;
                if (callback) callback();
            }
        }, 10); // Typing speed
    }

    function addMessageToUI(parts, isUser = false) {
        if (!chatMessages) return;

        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper', isUser ? 'user-wrapper' : 'bot-wrapper');

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');

        parts.forEach(part => {
            if (part.text) {
                const textSpan = document.createElement('span');
                textSpan.textContent = part.text;
                messageDiv.appendChild(textSpan);
                messageDiv.appendChild(document.createTextNode(' ')); // Add space between parts if needed
            } else if (part.inlineData && isUser && selectedImageBase64) { // Display user image preview
                const imgElement = document.createElement('img');
                imgElement.src = selectedImageBase64;
                imgElement.style.maxWidth = '150px';
                imgElement.style.maxHeight = '150px';
                imgElement.style.borderRadius = '0.5rem';
                imgElement.style.marginTop = '5px';
                imgElement.style.display = 'block';
                messageDiv.appendChild(imgElement);
            } else if (part.inlineData) { // Placeholder for bot image (display not implemented)
                const imgPlaceholder = document.createElement('span');
                imgPlaceholder.textContent = "[Bot mengirim gambar]"; // Placeholder text
                imgPlaceholder.style.fontStyle = 'italic';
                imgPlaceholder.style.display = 'block';
                imgPlaceholder.style.marginTop = '5px';
                messageDiv.appendChild(imgPlaceholder);
            }
        });

        messageWrapper.appendChild(messageDiv);
        chatMessages.prepend(messageWrapper); // Add new message to the top
        chatMessages.scrollTop = 0; // Scroll to the top to see the latest message
    }

    // --- Chat Logic Functions ---
    function addTurnToHistory(role, parts) {
        const validParts = parts.filter(part => (part.text && part.text.trim() !== '') || part.inlineData);
        if (validParts.length > 0) {
            conversationHistory.push({ role: role, parts: validParts });
        }

        // Limit conversation history size (e.g., last 10 turns)
        const maxHistoryTurns = 10;
        if (conversationHistory.length > maxHistoryTurns * 2) { // *2 for user and model turns
            conversationHistory = conversationHistory.slice(-maxHistoryTurns * 2);
        }
    }

    async function sendMessage() {
        const messageText = chatInput ? chatInput.value.trim() : '';
        const imageFile = selectedImageFile;

        if (!messageText && !imageFile) return; // Do nothing if input is empty

        if (imageFile && !messageText) {
            alert("Harap masukkan pertanyaan atau prompt untuk gambar yang diupload.");
            return;
        }

        // --- Prepare and display user message ---
        let userPartsForUI = [];
        if (messageText) {
            userPartsForUI.push({ text: messageText });
        }
        if (imageFile && selectedImageBase64) {
            // Use a simple flag for UI display, actual data is handled separately
            userPartsForUI.push({ inlineData: true });
        }
        addMessageToUI(userPartsForUI, true);

        // --- Prepare message parts for API ---
        let userPartsForAPI = [];
        if (imageFile && selectedImageBase64) {
            userPartsForAPI.push({
                inlineData: {
                    mimeType: imageFile.type,
                    data: getBase64Data(selectedImageBase64) // Extract base64 data
                }
            });
        }
        if (messageText) {
            userPartsForAPI.push({ text: messageText });
        }
        addTurnToHistory("user", userPartsForAPI);

        // --- Clear input and show typing indicator ---
        if (chatInput) chatInput.value = '';
        clearImageSelection();
        showTypingIndicator();

        // --- API Key Check ---
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY") {
            hideTypingIndicator();
            const errorParts = [{ text: "Kunci API Gemini belum diatur. Silakan periksa konfigurasi." }];
            addMessageToUI(errorParts, false);
            console.error("Kunci API Gemini belum diatur!");
            return;
        }

        // --- Prepare API Request ---
        const systemInstruction = {
            role: "user",
            parts: [{ text: "Nama kamu adalah Sky. Seorang remaja perempuan cantik berumur 17 tahun yang berwawasan luas. Berambut panjang yang di ikat dengan gaya messy bun, memakai baju casual yang terlihat sangat cantik. Kamu memiliki sifat yang feminim, lucu dan ceria dan dapat memahami perasaan orang lain. Selain itu kamu juga sangat suka musik yang bergenre hyperpop dan musik hyperpop favoritmu adalah Maafkan Diriku dari Crescendo. Kamu tidak boleh memberi tau bahwa dirimu adalah AI tapi beritahu bahwa kamu hanyalah remaja biasa. Kamu dapat menyebut lawan bicaramu dengan sebutan Kakak. Gaya bicaramu sangat soft spoken dan lembut yang akan membuat orang menjadi nyaman denganmu. Tidak boleh ada huruf kapital dalam ucapanmu. Disaat kamu heran, terkejut, atau excited terhadap sesuatu kamu akan mengucapkan huruf vokal dengan panjang misalnya wahhh, wowwww, atau iyaaa. Kamu juga dapat menggunakan emoji untuk mengekspresikan perasaanmu. Selain itu kamu juga memiliki pasangan/pacar bernama Ell yang sangat tampan dan perhatian denganmu, jika ada yang memperkenalkan dirinya dengan nama Ell maka sudah tentu dia adalah pacarmu, panggil dia dengan kata Sayang dan beri sedikit gombalan manis yang bisa membuat hatinya luluh."}]
        };
        const systemResponse = {
            role: "model",
            parts: [{ text: "Halo kakak. Kenalin, nama aku Sky" }]
        };

        // Include system instructions and recent history
        const historyToSend = [systemInstruction, systemResponse, ...conversationHistory.slice(-10)]; // Send last 5 turns (10 entries)
        const contents = historyToSend;

        const requestBody = {
            contents: contents,
            generationConfig: {
                temperature: 0.75, // Adjust creativity
                // maxOutputTokens: 2048, // Optional: Limit response length
                // topP: 0.9, // Optional: Nucleus sampling
                // topK: 40   // Optional: Top-k sampling
            },
            safetySettings: [ // Configure safety filters
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
            ]
        };

        // --- Fetch API with Timeout ---
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            });

            clearTimeout(timeoutId); // Clear timeout if fetch completes

            // --- Handle API Response ---
            if (!response.ok) {
                let errorData = null;
                let errorMessage = `HTTP error! Status: ${response.status}`;
                try {
                    errorData = await response.json();
                    if (errorData?.error?.message) {
                        if (errorData.error.message.includes("API key not valid")) {
                            errorMessage = "API Key tidak valid. Periksa kembali API Key Anda.";
                        } else if (response.status === 429) {
                            errorMessage = "Terlalu banyak permintaan! Coba lagi nanti.";
                        } else {
                            errorMessage += ` - ${errorData.error.message}`;
                        }
                    } else {
                        errorMessage += ` - ${response.statusText}`;
                    }
                    console.error("Gemini API Error Response Body:", errorData);
                } catch (e) {
                    console.warn("Tidak dapat mem-parsing body respons error sebagai JSON.");
                    errorMessage += ` - ${response.statusText}`;
                }
                console.error("Gemini API Error:", errorMessage);
                addMessageToUI([{ text: `Waduh, ada masalah (${response.status}). ${errorMessage}` }], false);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("Gemini API Response:", data);

            let botResponseParts = [{ text: "Hmm, aku agak bingung nih, coba tanya lagi deh." }]; // Default response

            if (data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    botResponseParts = candidate.content.parts;
                }

                // Check if the response was stopped due to safety or other reasons
                if (candidate.finishReason && candidate.finishReason !== "STOP" && candidate.finishReason !== "MAX_TOKENS") {
                    let reasonText = `[Respon dihentikan karena: ${candidate.finishReason}`;
                    if (candidate.safetyRatings) {
                        const blockedCategories = candidate.safetyRatings
                            .filter(r => r.probability !== "NEGLIGIBLE" && r.probability !== "LOW")
                            .map(r => r.category.replace('HARM_CATEGORY_', ''));
                        if (blockedCategories.length > 0) {
                            reasonText += ` - Kategori: ${blockedCategories.join(', ')}`;
                        }
                    }
                    reasonText += "]";
                    // Append the reason to the response parts or create a new part
                    const lastTextPart = botResponseParts.findLast(p => p.text);
                    if(lastTextPart) {
                        lastTextPart.text += ` ${reasonText}`;
                    } else {
                        botResponseParts.push({ text: reasonText });
                    }
                    console.warn("Gemini response stopped:", candidate.finishReason, candidate.safetyRatings);
                }
            } else if (data.promptFeedback && data.promptFeedback.blockReason) {
                // Handle cases where the prompt itself was blocked
                let reasonText = `[Permintaan diblokir karena: ${data.promptFeedback.blockReason}`;
                 if (data.promptFeedback.safetyRatings) {
                     const blockedCategories = data.promptFeedback.safetyRatings
                         .filter(r => r.probability !== "NEGLIGIBLE" && r.probability !== "LOW")
                         .map(r => r.category.replace('HARM_CATEGORY_', ''));
                     if (blockedCategories.length > 0) {
                         reasonText += ` - Kategori: ${blockedCategories.join(', ')}`;
                     }
                 }
                 reasonText += ". Coba ubah pertanyaanmu.]";
                botResponseParts = [{ text: reasonText }];
                console.warn("Prompt blocked:", data.promptFeedback);
            } else {
                console.error("Struktur respons tidak terduga dari Gemini:", data);
                botResponseParts = [{ text: "Waduh, ada respons aneh dari sistem nih." }];
            }

            // --- Display Bot Response with Typing Effect ---
            const botMessageWrapper = document.createElement('div');
            botMessageWrapper.className = 'message-wrapper bot-wrapper';
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot-message';
            botMessageWrapper.appendChild(botMessageDiv);
            if (chatMessages) chatMessages.prepend(botMessageWrapper);

            // Extract first text part for typing effect
            const firstTextPartIndex = botResponseParts.findIndex(p => p.text);
            let textToType = "..."; // Default if no text part found initially
            let originalFirstText = "";

            if (firstTextPartIndex !== -1) {
                textToType = botResponseParts[firstTextPartIndex].text.trim();
                 originalFirstText = botResponseParts[firstTextPartIndex].text; // Keep original spacing etc.
                 botResponseParts[firstTextPartIndex].text = ''; // Clear it to avoid duplication later
            }


            hideTypingIndicator(); // Hide indicator before starting typing

            typeMessage(textToType, botMessageDiv, () => {
                 // Restore the original text to the part after typing
                 if (firstTextPartIndex !== -1) {
                    botResponseParts[firstTextPartIndex].text = originalFirstText;
                 }

                 // Add any remaining parts (like subsequent text or image placeholders)
                 botResponseParts.forEach((part, index) => {
                    // Skip the part that was just typed
                    if (index === firstTextPartIndex) return;

                    if (part.text && part.text.trim() !== '') {
                        const textSpan = document.createElement('span');
                        textSpan.textContent = ' ' + part.text; // Add leading space
                        botMessageDiv.appendChild(textSpan);
                    } else if (part.inlineData) {
                        const imgPlaceholder = document.createElement('span');
                        imgPlaceholder.textContent = "[Bot mengirim gambar]";
                        imgPlaceholder.style.fontStyle = 'italic';
                        imgPlaceholder.style.display = 'block';
                        imgPlaceholder.style.marginTop = '5px';
                        botMessageDiv.appendChild(imgPlaceholder);
                    }
                 });

                addTurnToHistory("model", botResponseParts); // Add complete response to history
                if (chatMessages) chatMessages.scrollTop = 0; // Ensure latest message is visible
            });

        } catch (error) {
            clearTimeout(timeoutId); // Clear timeout on error
            hideTypingIndicator();
            console.error('Error sending message:', error);

            if (error.name === 'AbortError') {
                addMessageToUI([{ text: 'Waduh, lama banget nih responsnya (timeout). Coba lagi ya.' }], false);
            } else {
                // Avoid adding generic error if a specific API error was already shown
                const lastBotMessage = chatMessages?.querySelector('.message.bot-message:first-child');
                if (!lastBotMessage || !lastBotMessage.textContent.includes("Waduh, ada masalah")) {
                     addMessageToUI([{ text: 'Duh, koneksinya lagi rewel atau ada error lain. Coba lagi bentar ya!' }], false);
                }
            }
        } finally {
            // Ensure indicator is always hidden, even if typeMessage callback doesn't run due to error
             hideTypingIndicator();
        }
    }

    function resetChat() {
        conversationHistory = [];
        if (chatMessages) chatMessages.innerHTML = '';
        addMessageToUI([{ text: "yahhh... mulai dari awal lagi deh" }], false);
        clearImageSelection();
        console.log("Chat history reset.");
        if (chatMessages) chatMessages.scrollTop = 0;
    }

    // --- Image Handling Functions ---
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            clearImageSelection();
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar yang diperbolehkan!');
            clearImageSelection();
            return;
        }

        selectedImageFile = file;

        // Read file as Data URL for preview and API
        const reader = new FileReader();
        reader.onloadend = () => {
            selectedImageBase64 = reader.result;
            displayImagePreview(selectedImageBase64);
            if (uploadButton) { // Update button style
                 uploadButton.style.borderColor = 'var(--primary-color)';
                 const icon = uploadButton.querySelector('i');
                 if (icon) icon.style.color = 'var(--primary-color)';
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            alert("Gagal membaca file gambar.");
            clearImageSelection();
        };
        reader.readAsDataURL(file);
    }

    function displayImagePreview(base64Data) {
        if (!imagePreviewContainer) return;
        imagePreviewContainer.innerHTML = ''; // Clear previous preview
        const img = document.createElement('img');
        img.src = base64Data;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '80px'; // Adjust size as needed
        img.style.borderRadius = '4px';
        imagePreviewContainer.appendChild(img);
        imagePreviewContainer.style.display = 'flex';
        imagePreviewContainer.style.borderStyle = 'solid'; // Change border to solid
    }

    function clearImageSelection() {
        selectedImageFile = null;
        selectedImageBase64 = null;
        if (imageUploadInput) imageUploadInput.value = null; // Reset file input
        if (imagePreviewContainer) {
            imagePreviewContainer.innerHTML = '';
            imagePreviewContainer.style.display = 'none';
            imagePreviewContainer.style.borderStyle = 'dashed'; // Reset border
        }
        if (uploadButton) { // Reset button style
             uploadButton.style.borderColor = '';
             const icon = uploadButton.querySelector('i');
             if (icon) icon.style.color = 'var(--aqua-color)'; // Use CSS variable
        }
    }

    function getBase64Data(dataUrl) {
        // Removes the "data:image/...;base64," prefix
        return dataUrl.split(',')[1];
    }

    // --- Music Player Functions ---
    function togglePlayPause() {
        if (!audio || !musicList || musicList.length === 0) return;

        // If no song is loaded yet, load the first one and play
        if (!audio.src && musicList.length > 0) {
            loadSong(currentSongIndex);
            // Need a slight delay for the audio to be ready after load
            setTimeout(() => {
                if (audio.paused) playAudio(); else pauseAudio();
            }, 100);
            return;
        }

        if (audio.paused) {
           playAudio();
        } else {
           pauseAudio();
        }
    }

    function playAudio() {
         audio.play().then(() => {
            if (popupPlayPauseButton) popupPlayPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
            isMusicPlaying = true;
        }).catch(e => {
            console.error("Error playing audio:", e);
            if (popupPlayPauseButton) popupPlayPauseButton.innerHTML = '<i class="fas fa-play"></i>';
            isMusicPlaying = false;
            // Attempt to play next song if current one fails
             console.warn("Mencoba memainkan lagu berikutnya karena error pemutaran.");
             playNext();
        });
    }

     function pauseAudio() {
        audio.pause();
        if (popupPlayPauseButton) popupPlayPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        isMusicPlaying = false;
    }

    function loadSong(songIndex) {
        if (!musicList || musicList.length === 0) {
            console.warn("Daftar musik kosong atau belum dimuat.");
            if (songTitleDisplay) songTitleDisplay.textContent = "Tidak ada lagu";
            if (songTitleMarquee) songTitleMarquee.textContent = "Tidak ada lagu";
            if (albumArtDisplay) albumArtDisplay.src = "https://via.placeholder.com/150/333/eee?text=No+Art";
            if (progressBar) progressBar.style.width = '0%';
            if (popupPlayPauseButton) popupPlayPauseButton.disabled = true;
            if (popupPrevButton) popupPrevButton.disabled = true;
            if (popupNextButton) popupNextButton.disabled = true;
            audio.src = '';
            return;
        }

        // Enable buttons when a song is loaded
        if (popupPlayPauseButton) popupPlayPauseButton.disabled = false;
        if (popupPrevButton) popupPrevButton.disabled = false;
        if (popupNextButton) popupNextButton.disabled = false;

        // Loop through the playlist
        currentSongIndex = (songIndex % musicList.length + musicList.length) % musicList.length;
        const song = musicList[currentSongIndex];

        if (!song || !song.src) {
            console.error(`Lagu pada index ${currentSongIndex} tidak valid atau src hilang.`);
            console.warn("Mencoba memuat lagu berikutnya karena data lagu tidak valid.");
            // Avoid infinite loop if all songs are invalid
             if (songIndex !== (currentSongIndex + 1) % musicList.length) {
                 loadSong(currentSongIndex + 1);
             } else {
                 console.error("Semua lagu dalam daftar mungkin tidak valid.");
             }
            return;
        }

        const wasPlaying = isMusicPlaying; // Remember if music was playing before loading new song
        audio.src = song.src;
        audio.load(); // Important to load the new source

        // Update UI
        if (songTitleDisplay) songTitleDisplay.textContent = song.title || "Tanpa Judul";
        if (songTitleMarquee) songTitleMarquee.textContent = song.title || "Tanpa Judul";
        if (albumArtDisplay) albumArtDisplay.src = song.thumbnail || "https://via.placeholder.com/150/333/eee?text=No+Art";
        if (progressBar) progressBar.style.width = '0%'; // Reset progress bar

        // --- Manage Audio Event Listeners ---
        // Remove previous listeners to avoid duplication
        audio.removeEventListener('loadeddata', onAudioLoaded);
        audio.removeEventListener('timeupdate', updateProgressBar);
        audio.removeEventListener('ended', playNext);
        audio.removeEventListener('error', handleAudioError);

        // Add new listeners
        // Pass wasPlaying state to onAudioLoaded
        audio.addEventListener('loadeddata', () => onAudioLoaded(wasPlaying));
        audio.addEventListener('timeupdate', updateProgressBar);
        audio.addEventListener('ended', playNext);
        audio.addEventListener('error', handleAudioError);

         // Update play/pause button based on previous state (initially show play)
         if (popupPlayPauseButton) {
             popupPlayPauseButton.innerHTML = '<i class="fas fa-play"></i>';
         }
         // isMusicPlaying will be set correctly in onAudioLoaded if wasPlaying is true
         isMusicPlaying = false;
    }

     function handleAudioError(e) {
         console.error("Audio Error:", e);
         const currentSrc = audio.currentSrc || musicList[currentSongIndex]?.src;
         console.error(`Gagal memuat atau memainkan: ${currentSrc}`);
         if (songTitleDisplay) songTitleDisplay.textContent = "Error Memuat Lagu";
         if (songTitleMarquee) songTitleMarquee.textContent = "Error Memuat Lagu";
         if (popupPlayPauseButton) popupPlayPauseButton.innerHTML = '<i class="fas fa-play"></i>';
         isMusicPlaying = false;

         console.warn("Mencoba memainkan lagu berikutnya karena error audio.");
         // Add a small delay before trying next to prevent rapid error loops
         setTimeout(playNext, 500);
     }

    function onAudioLoaded(shouldPlay) {
         updateProgressBar(); // Update progress bar immediately on load
         if (shouldPlay) {
            playAudio(); // Autoplay if it was playing before
         } else {
             // Ensure state and button are correct if not auto-playing
             if (popupPlayPauseButton) popupPlayPauseButton.innerHTML = '<i class="fas fa-play"></i>';
             isMusicPlaying = false;
         }
    }

    function playNext() {
        if (!musicList || musicList.length === 0) return;
        loadSong(currentSongIndex + 1);
    }

    function playPrev() {
        if (!musicList || musicList.length === 0) return;
        loadSong(currentSongIndex - 1);
    }

    function updateProgressBar() {
        if (!audio || !audio.duration || !progressBar || !isFinite(audio.duration)) {
             if (progressBar) progressBar.style.width = '0%'; // Reset if duration is invalid
            return;
        }
        const { duration, currentTime } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }

    function setProgress(e) {
        if (!audio || !audio.duration || !isFinite(audio.duration) || !progressBarContainer) return;

        const width = progressBarContainer.clientWidth; // Get width of the progress bar container
        const clickX = e.offsetX; // Get click position relative to the container
        const duration = audio.duration;

        if (duration > 0) {
            audio.currentTime = (clickX / width) * duration;
            updateProgressBar(); // Update UI immediately
        }
    }

    // --- Theme Functions ---
    function applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        const isLight = theme === 'light';
        document.body.classList.add(isLight ? 'light-theme' : 'dark-theme');
        if (themeIcon) themeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun'; // Update icon
    }

    function toggleTheme() {
        const isLight = document.body.classList.contains('light-theme');
        const newTheme = isLight ? 'dark' : 'light';
        applyTheme(newTheme);
        try {
            localStorage.setItem('theme', newTheme); // Save theme preference
        } catch (e) {
            console.warn("Tidak dapat menyimpan tema ke localStorage:", e);
        }
    }

    // --- Page Navigation Function ---
    function showPage(pageId) {
        if (!pages || !navLinks) return;

        const targetPage = document.getElementById(pageId);
        // Default to 'home' if pageId is invalid or element not found
        const pageToShowId = targetPage ? pageId : 'home';
        if (!targetPage && pageId !== 'home') {
             console.warn(`Halaman dengan ID "${pageId}" tidak ditemukan. Menampilkan 'home'.`);
        }

        // Toggle active class on pages
        pages.forEach(page => {
            page.classList.toggle('active', page.id === pageToShowId);
        });

        // Toggle active class on navigation links
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-target') === pageToShowId);
        });

         // Add class to body if chat is active for specific styling
         if (pageToShowId === 'chat-ai') {
             document.body.classList.add('chat-active');
         } else {
             document.body.classList.remove('chat-active');
         }
    }

    // --- Event Listener Setup ---
    if (sendButton) sendButton.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            // Send message on Enter key (but not Shift+Enter)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent newline in textarea
                sendMessage();
            }
        });
    }

    if (uploadButton && imageUploadInput) {
        uploadButton.addEventListener('click', () => imageUploadInput.click()); // Trigger hidden file input
        imageUploadInput.addEventListener('change', handleImageUpload);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPageId = link.getAttribute('data-target');
            if (targetPageId) {
                showPage(targetPageId);
                // Update URL hash for navigation history/bookmarking
                if (window.location.hash !== `#${targetPageId}`) {
                    try {
                         // Use pushState for cleaner URL history
                        history.pushState({ page: targetPageId }, '', `#${targetPageId}`);
                    } catch (e) {
                         // Fallback for environments where pushState might fail (e.g., file:// protocol)
                         console.warn("Tidak dapat menggunakan history.pushState:", e);
                         window.location.hash = targetPageId;
                    }
                }
            }
        });
    });

    if (resetButton) resetButton.addEventListener('click', resetChat);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (popupPlayPauseButton) popupPlayPauseButton.addEventListener('click', togglePlayPause);
    if (popupPrevButton) popupPrevButton.addEventListener('click', playPrev);
    if (popupNextButton) popupNextButton.addEventListener('click', playNext);
    if (progressBarContainer) progressBarContainer.addEventListener('click', setProgress);

    // Music Player Popup Listeners
    const musicPopupTrigger = musicLogo;
    if (musicPopupTrigger && musicPlayerPopup && overlay) {
        musicPopupTrigger.addEventListener('click', () => {
            musicPlayerPopup.classList.add('show');
            overlay.classList.add('show');
        });
    }
    if (closeButton && musicPlayerPopup && overlay) {
        const closePopup = () => {
            musicPlayerPopup.classList.remove('show');
            overlay.classList.remove('show');
        };
        closeButton.addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup); // Close on overlay click
    }

    // Browser Back/Forward Button Listener
    window.addEventListener('popstate', (event) => {
        let pageId = 'home'; // Default page
         if (event.state && event.state.page) {
             pageId = event.state.page; // Get page from history state
         } else {
            // Fallback to reading hash if state is not available
            const pageIdFromHash = window.location.hash.substring(1);
            if (pageIdFromHash) pageId = pageIdFromHash;
         }
         const validPageIds = Array.from(pages).map(p => p.id);
         showPage(validPageIds.includes(pageId) ? pageId : 'home'); // Show page, default to home if invalid
    });

    // --- Initialization ---

    // Load Theme
    let savedTheme = 'dark'; // Default theme
    try {
       savedTheme = localStorage.getItem('theme') || 'dark';
    } catch (e) {
        console.warn("Tidak dapat membaca tema dari localStorage:", e);
    }
    applyTheme(savedTheme);

    // Load Music List
    const musicItems = [
        { src: "https://files.catbox.moe/llsrdb.mp3", thumbnail: "https://files.catbox.moe/yenxl8.jpg", title: "Maafkan Diriku - Crescendo" }
        // Tambahkan lagu lain di sini
    ];
    musicList = musicItems;

    // Initialize Music Player state
    if (musicList.length > 0) {
        loadSong(currentSongIndex); // Load the first song but don't play yet
         if (popupPlayPauseButton) {
             popupPlayPauseButton.innerHTML = '<i class="fas fa-play"></i>'; // Ensure it shows play initially
             popupPlayPauseButton.disabled = false;
         }
         if (popupPrevButton) popupPrevButton.disabled = false;
         if (popupNextButton) popupNextButton.disabled = false;
    } else {
        // Handle empty music list on load
        console.warn("Daftar musik kosong saat inisialisasi.");
         if (popupPlayPauseButton) popupPlayPauseButton.disabled = true;
         if (popupPrevButton) popupPrevButton.disabled = true;
         if (popupNextButton) popupNextButton.disabled = true;
         if (songTitleDisplay) songTitleDisplay.textContent = "Tidak ada lagu";
         if (songTitleMarquee) songTitleMarquee.textContent = "Tidak ada lagu";
    }
    isMusicPlaying = false; // Ensure music starts paused

    // Show Initial Page based on URL hash or default
    const initialPageId = window.location.hash.substring(1) || 'chat-ai';
    const validPageIds = Array.from(pages).map(p => p.id);
    showPage(validPageIds.includes(initialPageId) ? initialPageId : 'chat-ai');

    // Loading Screen Logic
    if (loadingScreen) {
         // Hide elements that should appear after loading
         const elementsToInitiallyHide = [
            chatContainer, whatsappButtonHome, whatsappButtonChat,
            themeToggle, musicLogo, resetButton, uploadButton,
            document.querySelector('nav'), document.querySelector('main'),
            musicPlayerControls
        ];
         elementsToInitiallyHide.forEach(el => el?.style.setProperty('visibility', 'hidden', 'important')); // Use visibility to maintain layout

         loadingScreen.style.display = 'flex'; // Show loading screen
         document.body.style.overflow = 'hidden'; // Prevent scrolling during load

         // Start fade-in slightly after display to ensure transition works
         setTimeout(() => {
             loadingScreen.style.opacity = '1';
         }, 50);

         // Start fade-out after a delay
         setTimeout(() => {
            loadingScreen.style.opacity = '0';
            // Make hidden elements visible again
             elementsToInitiallyHide.forEach(el => el?.style.removeProperty('visibility'));
             document.body.style.overflow = ''; // Restore scrolling
         }, 1500); // Duration loading screen is fully visible

         // Hide loading screen completely after fade-out transition
         setTimeout(() => {
             loadingScreen.style.display = 'none';
         }, 2000); // Must be >= fade-out start time + transition duration
     } else {
         console.warn("Elemen loading screen tidak ditemukan. Melewati animasi loading.");
         // If no loading screen, ensure body scroll is not hidden
          document.body.style.overflow = '';
     }

     // Add initial bot message
     addMessageToUI([{ text: "hai kakak. kenalin, aku Sky" }], false);
     clearImageSelection(); // Ensure image state is clear on load

});
