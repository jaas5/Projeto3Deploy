const API_BASE = '/api';

// === UTILS ===
function getAuthUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function setAuthUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// === UI HELPERS (Toast & Modal) ===

function injectToastAndModalHTML() {
    // Toast Container
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Confirm Modal
    if (!document.getElementById('custom-confirm-modal')) {
        const modalHTML = `
            <div id="custom-confirm-modal">
                <div class="confirm-modal-content">
                    <p id="confirm-message">Tem certeza?</p>
                    <div class="confirm-actions">
                        <button id="btn-confirm-no" class="btn-confirm-no">Cancelar</button>
                        <button id="btn-confirm-yes" class="btn-confirm-yes">Sim</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle" style="color:var(--accent-green)"></i>';
    else if (type === 'error') icon = '<i class="fas fa-exclamation-circle" style="color:#dc3545"></i>';
    else icon = '<i class="fas fa-info-circle" style="color:var(--primary-blue)"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

let confirmCallback = null;

function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('custom-confirm-modal');
    const msgParams = document.getElementById('confirm-message');
    const btnYes = document.getElementById('btn-confirm-yes');
    const btnNo = document.getElementById('btn-confirm-no');
    
    if (!modal) return;

    msgParams.innerText = message;
    confirmCallback = onConfirm;

    modal.style.display = 'flex';

    // Assign handlers
    btnYes.onclick = () => {
        if (confirmCallback) confirmCallback();
        closeConfirmModal();
    };
    
    btnNo.onclick = closeConfirmModal;
    
    // Close on click outside
    modal.onclick = (e) => {
        if (e.target === modal) closeConfirmModal();
    };
}

function closeConfirmModal() {
    const modal = document.getElementById('custom-confirm-modal');
    if (modal) modal.style.display = 'none';
    confirmCallback = null;
}

// === FEEDBACKS ===

async function fetchFeedbacks() {
    try {
        const response = await fetch(`${API_BASE}/feedbacks`);
        if (!response.ok) throw new Error('Erro ao carregar feedbacks');
        const feedbacks = await response.json();
        renderFeedbacks(feedbacks);
        checkUserVotes(); // Highlight voted feedbacks
    } catch (error) {
        console.error(error);
        // showToast('Não foi possível carregar os feedbacks.', 'error');
    }
}

async function fetchFeedbacksByCategoria(categoria) {
    try {
        const response = await fetch(`${API_BASE}/feedbacks/categoria/${categoria}`);
        if (response.status === 204) {
            renderFeedbacks([]);
            return;
        }
        const feedbacks = await response.json();
        renderFeedbacks(feedbacks);
        checkUserVotes(); // Highlight voted feedbacks
    } catch (error) {
        console.error(error);
    }
}

// Fetch ranking
async function fetchRanking() {
    try {
        const response = await fetch(`${API_BASE}/feedbacks/ranking`);
        if (response.ok) {
            const feedbacks = await response.json();
            renderRanking(feedbacks);
        } else {
            console.error('Failed to fetch ranking');
        }
    } catch (error) {
        console.error('Error fetching ranking:', error);
    }
}

// Render ranking
function renderRanking(feedbacks) {
    const container = document.getElementById('ranking-list');
    if (!container) return;

    container.innerHTML = '';

    if (feedbacks.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Nenhum feedback votado ainda.</p>';
        return;
    }

    feedbacks.forEach((fb, index) => {
        const rank = index + 1; // 1, 2, 3
        // Map index to medal image if available, otherwise just use badge?
        // Requirement: use medalha1.png, medalha2.png, medalha3.png
        const medalImg = `images/medalha${rank}.png`;

        const card = document.createElement('div');
        card.className = 'ranking-card';
        card.innerHTML = `
            <div class="ranking-badge-img">
                <img src="${medalImg}" alt="${rank}º Lugar">
            </div>
            <h4>${fb.titulo || 'Sem título'}</h4>
            <p>${fb.mensagem || ''}</p>
            <div class="card-footer">
                <span><i class="far fa-clock"></i> ${formatDate(fb.dataCriacao || new Date())}</span>
                <span class="tag tag-outline-blue">${fb.categoria || 'Geral'}</span>
                <button class="arrow-btn" onclick="window.location.href='feedback-detalhes.html?id=${fb.idFeedback}'"><i class="fas fa-arrow-right"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderFeedbacks(feedbacks) {
    const container = document.getElementById('feedback-list');
    if (!container) return;

    container.innerHTML = '';

    if (feedbacks.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px; color: #555;">Nenhum feedback encontrado.</p>';
        return;
    }

    feedbacks.forEach(fb => {
        const card = document.createElement('div');
        card.className = 'feedback-item';
        
        // Determine Tag Styles
        let catTagClass = 'tag tag-outline-blue';
        let statusTagClass = '';
        let statusText = fb.status;
        let cursoText = fb.curso ? fb.curso.replace(/_/g, ' ') : '';
        
        if (statusText === 'Em_analise' || statusText === 'Pendente' || statusText === 'PENDENTE') statusText = 'Em Análise';
        
        if (fb.status === 'Em Análise' || fb.status === 'EM_ANALISE' || fb.status === 'Em_analise') statusTagClass = 'tag tag-yellow-fill';
        else if (fb.status === 'Implementado' || fb.status === 'IMPLEMENTADO') statusTagClass = 'tag tag-green-fill';
        else if (fb.status === 'Pendente' || fb.status === 'PENDENTE') statusTagClass = 'tag tag-yellow-fill';
        else statusTagClass = 'tag tag-outline-blue'; // Default or if missing

        card.innerHTML = `
            <div class="vote-section">
                <button class="vote-btn" id="vote-btn-${fb.idFeedback}" onclick="voteFeedback(${fb.idFeedback})">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <span class="vote-count" id="vote-count-${fb.idFeedback}">${fb.likes || 0}</span>
            </div>
            <div class="feedback-content-area">
                <div class="feedback-tags">
                    <span class="${catTagClass}">${fb.categoria || 'Geral'}</span>
                    ${cursoText ? `<span class="tag tag-curso">${cursoText}</span>` : ''}
                    ${fb.status ? `<span class="${statusTagClass}">${statusText}</span>` : ''} 
                </div>
                <h3>${fb.titulo || 'Sem título'}</h3>
                <p>${fb.mensagem || ''}</p>
                <div class="feedback-meta">
                    <span class="author">${fb.usuario ? fb.usuario.username : 'Anônimo'}</span>
                    <span>•</span>
                    <span>${formatDate(fb.dataCriacao || new Date())}</span>
                    <span>•</span>
                    <button class="btn-small" onclick="toggleComments(${fb.idFeedback})" style="background:none; color:#666; border:none; padding:0; font-size:0.85rem;">
                        <i class="far fa-comment-alt"></i> Comentários
                    </button>
                </div>
                
                <!-- Comments Section -->
                <div id="comments-${fb.idFeedback}" class="comments-section">
                    <div id="comments-list-${fb.idFeedback}" class="comment-list">
                        <!-- Comments loaded here -->
                    </div>
                    <form class="comment-form" onsubmit="submitComment(event, ${fb.idFeedback})">
                        <textarea placeholder="Escreva um comentário..." required></textarea>
                        <button type="submit" class="btn-small" style="background: var(--ranking-bg); color:white;">Enviar</button>
                    </form>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function checkUserVotes() {
    const user = getAuthUser();
    if (!user) return;

    try {
        const response = await fetch(`${API_BASE}/feedbacks/votes/${user.idUser}`);
        if (response.ok) {
            const votedIds = await response.json();
            votedIds.forEach(id => {
                const btn = document.getElementById(`vote-btn-${id}`);
                if (btn) btn.classList.add('active');
            });
        }
    } catch (error) {
        console.error("Error fetching user votes:", error);
    }
}

async function voteFeedback(id) {
    const user = getAuthUser();
    if (!user) {
        showToast("Você precisa estar logado para votar.", 'info');
        return;
    }

    try {
        // Updated URL: removed upvote param since it's now a toggle
        const response = await fetch(`${API_BASE}/feedbacks/${id}/vote?userId=${user.idUser}`, {
            method: 'POST'
        });
        if (response.ok) {
            const updatedFeedback = await response.json();
            document.getElementById(`vote-count-${id}`).innerText = updatedFeedback.likes;
            
            // Toggle active class
            const btn = document.getElementById(`vote-btn-${id}`);
            btn.classList.toggle('active');
            
            // Update ranking dynamically
            fetchRanking();
        }
    } catch (error) {
        console.error(error);
    }
}

function toggleComments(id) {
    const section = document.getElementById(`comments-${id}`);
    if (section.style.display === 'block') {
        section.style.display = 'none';
    } else {
        section.style.display = 'block';
        loadComments(id);
    }
}

async function loadComments(feedbackId) {
    const container = document.getElementById(`comments-list-${feedbackId}`);
    container.innerHTML = '<p>Carregando...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/comentarios/feedback/${feedbackId}`);
        if (response.status === 204) {
            container.innerHTML = '<p>Seja o primeiro a comentar!</p>';
            return;
        }
        const comentarios = await response.json();
        const tree = buildCommentTree(comentarios);
        renderCommentTreeForIndex(tree, container, feedbackId);
        
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Erro ao carregar comentários.</p>';
    }
}

function renderCommentTreeForIndex(comments, container, feedbackId, level = 0) {
    if (level === 0) container.innerHTML = ''; // Clear only on root call

    if (comments.length === 0 && level === 0) {
        container.innerHTML = '<p>Seja o primeiro a comentar!</p>';
        return;
    }

    const currentUser = getAuthUser();

    comments.forEach(c => {
        const isOwner = currentUser && c.usuario && c.usuario.idUser === currentUser.idUser;
        const commentEl = document.createElement('div');
        commentEl.className = `comment-item ${level > 0 ? 'reply-item' : ''}`;
        if (level > 0) {
            commentEl.style.marginLeft = `${level * 20}px`;
        }
        
        commentEl.innerHTML = `
            <div class="comment-meta">
                <span><strong>${c.usuario ? c.usuario.username : 'Anônimo'}</strong> - ${formatDate(c.data)}</span>
                <div class="comment-actions">
                    <button class="btn-reply" onclick="toggleReplyForm(${c.idComentario})"><i class="fas fa-reply"></i> Responder</button>
                    ${isOwner ? `<button onclick="deleteComment(${c.idComentario}, ${feedbackId})" class="btn-delete-comment"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            </div>
            <div class="comment-body">${c.mensagem}</div>
            
            <!-- Reply Form Container -->
            <div id="reply-form-${c.idComentario}" class="reply-form-container" style="display:none; margin-top: 10px;">
                <form onsubmit="submitReply(event, ${feedbackId}, ${c.idComentario})">
                    <textarea rows="2" placeholder="Sua resposta..." required style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; border:1px solid #ddd; font-family:inherit; resize:vertical;"></textarea>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="btn-small" onclick="toggleReplyForm(${c.idComentario})" style="background:#f0f0f0; color:#666;">Cancelar</button>
                        <button type="submit" class="btn-small" style="background: var(--ranking-bg); color:white;">Enviar</button>
                    </div>
                </form>
            </div>
            
            <!-- Children Container -->
            <div id="children-${c.idComentario}"></div>
        `;
        
        container.appendChild(commentEl);
        
        if (c.children && c.children.length > 0) {
            const childrenContainer = commentEl.querySelector(`#children-${c.idComentario}`);
            renderCommentTreeForIndex(c.children, childrenContainer, feedbackId, level + 1);
        }
    });
}

async function deleteComment(commentId, feedbackId) {
    showConfirmModal('Excluir comentário?', async () => {
        const user = getAuthUser();
        if (!user) return;

        try {
            const response = await fetch(`${API_BASE}/comentarios/${commentId}?userId=${user.idUser}`, {
                method: 'DELETE'
            });

            if (response.ok || response.status === 204) {
                loadComments(feedbackId);
            } else {
                showToast('Erro ao excluir comentário.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Erro de conexão.', 'error');
        }
    });
}

async function submitComment(event, feedbackId) {
    event.preventDefault();
    const textarea = event.target.querySelector('textarea');
    const mensagem = textarea.value;
    submitCommentToFeedback(feedbackId, mensagem, null);
}

async function submitReply(event, feedbackId, parentId) {
    event.preventDefault();
    const textarea = event.target.querySelector('textarea');
    const mensagem = textarea.value;
    submitCommentToFeedback(feedbackId, mensagem, parentId);
}

let selectedNPS = null;

function setupNPS() {
    const buttons = document.querySelectorAll('.nps-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove selected from all
            buttons.forEach(b => b.classList.remove('selected'));
            // Add to clicked
            e.target.classList.add('selected');
            selectedNPS = parseInt(e.target.dataset.value);
        });
    });
}

async function submitFeedback(event) {
    event.preventDefault();
    
    // Validation
    if (selectedNPS === null) {
        showToast('Por favor, selecione uma nota de 0 a 10 para recomendar o curso.', 'info');
        return;
    }

    const titulo = document.getElementById('titulo').value;
    const conteudo = document.getElementById('conteudo').value; 
    const categoria = document.getElementById('categoria').value;
    const curso = document.getElementById('curso').value;
    
    const user = getAuthUser();
    if (!user) {
        showToast('Você precisa estar logado para enviar um feedback.', 'info');
        window.location.href = 'login.html';
        return;
    }

    const feedback = {
        titulo,
        mensagem: conteudo,
        categoria,
        curso,
        nps: selectedNPS,
        usuario: { idUser: user.idUser }
    };

    try {
        const response = await fetch(`${API_BASE}/feedbacks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedback)
        });

        if (response.ok) {
            showToast('Feedback enviado com sucesso!', 'success');
            
            // Check if we're on the create feedback page or modal
            const page = window.location.pathname.split('/').pop();
            if (page === 'criar-feedback.html') {
                // Check where the user came from
                const params = new URLSearchParams(window.location.search);
                const from = params.get('from');
                
                // Redirect based on origin
                setTimeout(() => {
                    if (from === 'meus-feedbacks') {
                        window.location.href = 'meus-feedbacks.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            } else {
                // Modal behavior (fallback)
                closeModal();
                // Reset form
                document.getElementById('feedbackForm').reset();
                document.querySelectorAll('.nps-btn').forEach(b => b.classList.remove('selected'));
                selectedNPS = null;
                fetchFeedbacks(); // Refresh list
                fetchRanking(); // Refresh ranking
            }
        } else {
            showToast('Erro ao enviar feedback.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Erro de conexão.', 'error');
    }
}

// === USERS (LOGIN/REGISTER) ===

async function registerUser(event) {
    event.preventDefault();
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;

    try {
        // Backend expects username, password, and now email.
        const response = await fetch(`${API_BASE}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: nome, email: email, password: senha })
        });

        if (response.ok) {
            showToast('Cadastro realizado! Faça login.', 'success');
            toggleAuthMode();
        } else {
            showToast('Erro ao cadastrar.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Erro de conexão.', 'error');
    }
}

async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        // Using server-side secure login endpoint
        const response = await fetch(`${API_BASE}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password: senha }) // Send input as username, backend checks both
        });

        if (response.ok) {
            const user = await response.json();
            setAuthUser(user);
            window.location.href = 'index.html';
        } else {
            showToast('Email/Usuário ou senha incorretos.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Erro ao tentar login.', 'error');
    }
}

// === PAGE INIT ===

document.addEventListener('DOMContentLoaded', () => {
    injectToastAndModalHTML();

    const page = window.location.pathname.split('/').pop();

    if (page === 'index.html' || page === '') {
        setupNPS(); // Init NPS listeners

        // Check Auth
        const user = getAuthUser();
        const authBtn = document.getElementById('auth-btn-container');
        if (user && authBtn) {
            authBtn.innerHTML = `
                <div class="user-profile" onclick="logout()" title="Sair">
                    <span>Olá, ${user.username}</span>
                    <div class="avatar"><i class="fas fa-user"></i></div>
                </div>
            `;
        }

        fetchFeedbacks();
        fetchRanking(); // Load ranking dynamically

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add to clicked
                e.target.classList.add('active');
                
                const cat = e.target.dataset.category;
                if (cat === 'all') fetchFeedbacks();
                else fetchFeedbacksByCategoria(cat);
            });
        });

        // Form submission
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm) feedbackForm.addEventListener('submit', submitFeedback);
    }

    if (page === 'login.html') {
        const loginForm = document.getElementById('login-form');
        const regForm = document.getElementById('register-form');

        if (loginForm) loginForm.addEventListener('submit', loginUser);
        if (regForm) regForm.addEventListener('submit', registerUser);
    }

    if (page === 'meus-feedbacks.html') {
        const user = getAuthUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        // Setup Auth Header
        const authBtn = document.getElementById('auth-btn-container');
        if (user && authBtn) {
            authBtn.innerHTML = `
                <div class="user-profile" onclick="logout()" title="Sair">
                    <span>Olá, ${user.username}</span>
                    <div class="avatar"><i class="fas fa-user"></i></div>
                </div>
            `;
        }

        fetchUserFeedbacks(user.idUser);
        
        const editForm = document.getElementById('editForm');
        if(editForm) editForm.addEventListener('submit', submitEdit);
    }
});

// === MEUS FEEDBACKS LOGIC ===

let currentUserFeedbacks = [];

async function fetchUserFeedbacks(userId) {
    try {
        const response = await fetch(`${API_BASE}/feedbacks/usuario/${userId}`);
        if (response.status === 204) {
            currentUserFeedbacks = [];
            renderStats([]);
            renderRecents([]);
            renderPersonalMural([]);
            return;
        }
        currentUserFeedbacks = await response.json();
        
        renderStats(currentUserFeedbacks);
        renderRecents(currentUserFeedbacks);
        renderPersonalMural(currentUserFeedbacks);
        
    } catch (error) {
        console.error('Erro ao buscar feedbacks do usuário:', error);
    }
}

function renderStats(feedbacks) {
    const implemented = feedbacks.filter(f => f.status === 'Implementado' || f.status === 'IMPLEMENTADO').length;
    const analysis = feedbacks.filter(f => f.status === 'Em Análise' || f.status === 'EM_ANALISE' || f.status === 'Em_analise').length;
    const total = feedbacks.length;

    document.getElementById('stat-implemented').innerText = implemented;
    document.getElementById('stat-analysis').innerText = analysis;
    document.getElementById('stat-total').innerText = total;
}

function renderRecents(feedbacks) {
    const container = document.getElementById('recent-list');
    // Sort by date desc
    const sorted = [...feedbacks].sort((a, b) => new Date(b.dataCriacao || b.data) - new Date(a.dataCriacao || a.data));
    // Take top 3
    const recent = sorted.slice(0, 3);

    container.innerHTML = '';
    if (recent.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">Nenhum feedback recente.</p>';
        return;
    }

    recent.forEach(fb => {
        const card = document.createElement('div');
        card.className = 'recent-card';
        card.innerHTML = `
            <h4 style="margin-bottom:10px;">${fb.titulo}</h4>
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 15px;">${fb.mensagem}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size: 0.8rem; color: #888;">
                <span><i class="far fa-clock"></i> ${formatDate(fb.dataCriacao || fb.data)}</span>
                <span style="color: var(--primary-blue); font-weight:bold;">${fb.likes} votos</span>
            </div>
        `;
        container.appendChild(card);
    });
}

    function renderPersonalMural(feedbacks) {
    const container = document.getElementById('my-feedback-list');
    container.innerHTML = '';

    if (feedbacks.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #777;">Você ainda não postou nenhum feedback.</p>';
        return;
    }

    feedbacks.forEach(fb => {
        // Tags
        let statusTagClass = '';
        let statusText = fb.status;
        let cursoText = fb.curso ? fb.curso.replace(/_/g, ' ') : '';
        
        if (statusText === 'Em_analise') statusText = 'Em Análise';
        
        if (fb.status === 'Em Análise' || fb.status === 'EM_ANALISE' || fb.status === 'Em_analise') statusTagClass = 'tag tag-yellow-fill';
        else if (fb.status === 'Implementado' || fb.status === 'IMPLEMENTADO') statusTagClass = 'tag tag-green-fill';
        else if (fb.status === 'Pendente' || fb.status === 'PENDENTE') statusTagClass = 'tag tag-yellow-fill';
        else statusTagClass = 'tag tag-outline-blue';

        const item = document.createElement('div');
        item.className = 'mural-card';
        item.innerHTML = `
            <div class="feedback-actions">
                <button class="btn-edit" onclick="openEditModal(${fb.idFeedback})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteFeedback(${fb.idFeedback})" title="Excluir"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="feedback-tags" style="margin-bottom: 10px;">
                <span class="tag tag-outline-blue">${fb.categoria || 'Geral'}</span>
                ${cursoText ? `<span class="tag tag-curso">${cursoText}</span>` : ''}
                <span class="${statusTagClass}">${statusText}</span>
            </div>
            <h3 style="margin-bottom: 5px;">${fb.titulo}</h3>
            <p style="color: #555; margin-bottom: 10px;">${fb.mensagem}</p>
            <div style="font-size: 0.85rem; color: #999;">
                Postado em ${formatDate(fb.dataCriacao || fb.data)} • ${fb.likes} votos
            </div>
        `;
        container.appendChild(item);
    });
}

async function deleteFeedback(id) {
    showConfirmModal('Tem certeza que deseja excluir este feedback?', async () => {
        try {
            const response = await fetch(`${API_BASE}/feedbacks/${id}`, {
                method: 'DELETE'
            });

            if (response.ok || response.status === 204) {
                showToast('Feedback excluído.', 'success');
                const user = getAuthUser();
                if(user) fetchUserFeedbacks(user.idUser);
            } else {
                showToast('Erro ao excluir.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Erro de conexão.', 'error');
        }
    });
}

function openEditModal(id) {
    const feedback = currentUserFeedbacks.find(f => f.idFeedback === id);
    if (!feedback) return;

    const modal = document.getElementById('editModal');
    document.getElementById('edit-id').value = feedback.idFeedback;
    document.getElementById('edit-titulo').value = feedback.titulo;
    document.getElementById('edit-conteudo').value = feedback.mensagem;
    document.getElementById('edit-categoria').value = feedback.categoria;
    
    modal.style.display = "flex";
}

function closeEditModal() {
    document.getElementById('editModal').style.display = "none";
}

async function submitEdit(event) {
    event.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const titulo = document.getElementById('edit-titulo').value;
    const mensagem = document.getElementById('edit-conteudo').value;
    const categoria = document.getElementById('edit-categoria').value;
    
    try {
        const response = await fetch(`${API_BASE}/feedbacks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, mensagem, categoria })
        });
        
        if (response.ok) {
            showToast('Feedback atualizado!', 'success');
            closeEditModal();
            const user = getAuthUser();
            if(user) fetchUserFeedbacks(user.idUser);
        } else {
            showToast('Erro ao atualizar.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Erro de conexão.', 'error');
    }
}

// Update window click for second modal
const originalWindowClick = window.onclick;
window.onclick = function(event) {
    if (originalWindowClick) originalWindowClick(event);
    
    const editModal = document.getElementById('editModal');
    if (event.target == editModal) {
        editModal.style.display = "none";
    }
}

// Modal Functions (Globals)
function openModal() {
    document.getElementById('feedbackModal').style.display = "flex";
}

function closeModal() {
    document.getElementById('feedbackModal').style.display = "none";
}

function toggleAuthMode() {
    const loginBox = document.getElementById('login-box');
    const regBox = document.getElementById('register-box');
    
    if (loginBox.style.display === 'none') {
        loginBox.style.display = 'block';
        regBox.style.display = 'none';
    } else {
        loginBox.style.display = 'none';
        regBox.style.display = 'block';
    }
}

// Additional global modal closer for the original modal
// Note: window.onclick handles it via originalWindowClick if set, but we can ensure logic covers both
window.addEventListener('click', (event) => {
    const feedbackModal = document.getElementById('feedbackModal');
    if (event.target == feedbackModal) {
        feedbackModal.style.display = "none";
    }
});


// === FEEDBACK DETAILS PAGE LOGIC ===

async function initFeedbackDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        document.getElementById('feedback-detail-container').innerHTML = '<p>Feedback não encontrado.</p>';
        return;
    }

    await fetchFeedbackDetails(id);
    await loadDetailedComments(id);

    // Setup Main Comment Form
    const mainForm = document.getElementById('main-comment-form');
    if (mainForm) {
        mainForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = document.getElementById('main-comment-text').value;
            submitCommentToFeedback(id, msg, null); // null = no parent
        });
    }
}

async function fetchFeedbackDetails(id) {
    const container = document.getElementById('feedback-detail-container');
    try {
        const response = await fetch(`${API_BASE}/feedbacks/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar feedback');
        const fb = await response.json();
        
        // Tags
        let catTagClass = 'tag tag-outline-blue';
        let statusTagClass = '';
        let statusText = fb.status;
        let cursoText = fb.curso ? fb.curso.replace(/_/g, ' ') : '';
        
        if (statusText === 'Em_analise' || statusText === 'Pendente' || statusText === 'PENDENTE') statusText = 'Em Análise';
        
        if (fb.status === 'Em Análise' || fb.status === 'EM_ANALISE' || fb.status === 'Em_analise') statusTagClass = 'tag tag-yellow-fill';
        else if (fb.status === 'Implementado' || fb.status === 'IMPLEMENTADO') statusTagClass = 'tag tag-green-fill';
        else if (fb.status === 'Pendente' || fb.status === 'PENDENTE') statusTagClass = 'tag tag-yellow-fill';
        else statusTagClass = 'tag tag-outline-blue';

        container.innerHTML = `
            <div class="feedback-detail-header">
                <h2>${fb.titulo}</h2>
            </div>
            
            <div class="feedback-detail-body" style="margin-bottom: 20px;">
                <p>${fb.mensagem}</p>
            </div>

            <div class="feedback-detail-actions" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                <div class="feedback-tags">
                    <span class="${catTagClass}">${fb.categoria || 'Geral'}</span>
                    ${cursoText ? `<span class="tag tag-curso">${cursoText}</span>` : ''}
                    ${fb.status ? `<span class="${statusTagClass}">${statusText}</span>` : ''}
                </div>
                
                <div class="feedback-meta-info" style="display: flex; align-items: center; gap: 20px;">
                    <span style="color: #666; font-size: 0.9rem;"><i class="fas fa-user"></i> ${fb.usuario ? fb.usuario.username : 'Anônimo'}</span>
                    <span style="color: #666; font-size: 0.9rem;"><i class="far fa-clock"></i> ${formatDate(fb.dataCriacao || new Date())}</span>
                    
                    <div class="vote-wrapper" style="display: flex; align-items: center; gap: 10px;">
                        <button class="vote-btn" id="vote-btn-${fb.idFeedback}" onclick="voteFeedback(${fb.idFeedback})">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <span class="vote-count" id="vote-count-${fb.idFeedback}" style="margin:0;">${fb.likes}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Check if user voted to highlight button
        checkUserVotes();
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Erro ao carregar detalhes.</p>';
    }
}

async function loadDetailedComments(feedbackId) {
    const container = document.getElementById('comments-container-full');
    container.innerHTML = '<p>Carregando comentários...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/comentarios/feedback/${feedbackId}`);
        if (response.status === 204) {
            container.innerHTML = '<p>Seja o primeiro a comentar!</p>';
            return;
        }
        const comentarios = await response.json();
        const tree = buildCommentTree(comentarios);
        renderCommentTree(tree, container, feedbackId);
        
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Erro ao carregar comentários.</p>';
    }
}

function buildCommentTree(comments) {
    const map = {};
    const roots = [];
    
    // Sort by date first to ensure order
    comments.sort((a, b) => new Date(a.data) - new Date(b.data));

    comments.forEach(c => {
        c.children = [];
        map[c.idComentario] = c;
    });
    
    comments.forEach(c => {
        if (c.parentId && map[c.parentId]) {
             map[c.parentId].children.push(c);
        } else {
            roots.push(c);
        }
    });
    
    return roots;
}

function renderCommentTree(comments, container, feedbackId, level = 0) {
    if (level === 0) container.innerHTML = ''; // Clear only on root call

    if (comments.length === 0 && level === 0) {
        container.innerHTML = '<p>Nenhum comentário ainda.</p>';
        return;
    }

    const currentUser = getAuthUser();

    comments.forEach(c => {
        const isOwner = currentUser && c.usuario && c.usuario.idUser === currentUser.idUser;
        const commentEl = document.createElement('div');
        commentEl.className = `comment-item ${level > 0 ? 'reply-item' : ''}`;
        commentEl.style.marginLeft = `${level * 20}px`;
        
        commentEl.innerHTML = `
            <div class="comment-meta">
                <span><strong>${c.usuario ? c.usuario.username : 'Anônimo'}</strong> - ${formatDate(c.data)}</span>
                <div class="comment-actions">
                   <button class="btn-reply" onclick="toggleReplyForm(${c.idComentario})"><i class="fas fa-reply"></i> Responder</button>
                   ${isOwner ? `<button onclick="deleteComment(${c.idComentario}, ${feedbackId}, true)" class="btn-delete-comment"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            </div>
            <div class="comment-body">${c.mensagem}</div>
            
            <!-- Reply Form Container -->
            <div id="reply-form-${c.idComentario}" class="reply-form-container" style="display:none; margin-top: 10px;">
                <form onsubmit="submitReply(event, ${feedbackId}, ${c.idComentario})">
                    <textarea rows="2" placeholder="Sua resposta..." required style="width:100%; padding:5px; margin-bottom:5px;"></textarea>
                    <button type="button" class="btn-small" onclick="toggleReplyForm(${c.idComentario})">Cancelar</button>
                    <button type="submit" class="btn-small btn-primary">Enviar</button>
                </form>
            </div>
            
            <!-- Children Container -->
            <div id="children-${c.idComentario}"></div>
        `;
        
        container.appendChild(commentEl);
        
        if (c.children && c.children.length > 0) {
            const childrenContainer = commentEl.querySelector(`#children-${c.idComentario}`);
            renderCommentTree(c.children, childrenContainer, feedbackId, level + 1);
        }
    });
}

function toggleReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form.style.display === 'none') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
}

async function submitReply(event, feedbackId, parentId) {
    event.preventDefault();
    const textarea = event.target.querySelector('textarea');
    const mensagem = textarea.value;
    submitCommentToFeedback(feedbackId, mensagem, parentId);
}

async function submitCommentToFeedback(feedbackId, mensagem, parentId) {
    const user = getAuthUser();
    if (!user) {
        showToast('Faça login para comentar.', 'info');
        window.location.href = 'login.html';
        return;
    }

    try {
        const payload = {
            mensagem: mensagem,
            feedbackId: feedbackId,
            userId: user.idUser,
            parentId: parentId
        };
        
        const response = await fetch(`${API_BASE}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            showToast('Comentário enviado!', 'success');
            // Reload comments - check if we're on details page or index page
            const page = window.location.pathname.split('/').pop();
            if (page === 'feedback-detalhes.html') {
                loadDetailedComments(feedbackId);
                // Clear main form if it was a main comment
                if (!parentId) {
                    const mainText = document.getElementById('main-comment-text');
                    if (mainText) mainText.value = '';
                }
            } else {
                // On index.html, reload comments in the card
                loadComments(feedbackId);
                // Clear form in the card
                if (!parentId) {
                    const commentForm = document.querySelector(`#comments-${feedbackId} form`);
                    if (commentForm) {
                        const textarea = commentForm.querySelector('textarea');
                        if (textarea) textarea.value = '';
                    }
                }
            }
        } else {
            showToast('Erro ao enviar comentário.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Erro de conexão.', 'error');
    }
}

// Override deleteComment to handle page reload on details page
const originalDeleteComment = deleteComment;
deleteComment = async function(commentId, feedbackId, isDetailsPage = false) {
     showConfirmModal('Excluir comentário?', async () => {
        const user = getAuthUser();
        if (!user) return;

        try {
            const response = await fetch(`${API_BASE}/comentarios/${commentId}?userId=${user.idUser}`, {
                method: 'DELETE'
            });

            if (response.ok || response.status === 204) {
                if (isDetailsPage) {
                    loadDetailedComments(feedbackId);
                } else {
                    loadComments(feedbackId); // Old function for index.html modal/card
                }
            } else {
                showToast('Erro ao excluir comentário.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Erro de conexão.', 'error');
        }
    });
};

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();
    if (page === 'feedback-detalhes.html') {
        initFeedbackDetailsPage();
    }
    
    if (page === 'criar-feedback.html') {
        setupNPS(); // Init NPS listeners
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm) feedbackForm.addEventListener('submit', submitFeedback);
        
        // Setup back link based on origin
        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        const backLink = document.getElementById('back-link');
        if (backLink) {
            if (from === 'meus-feedbacks') {
                backLink.href = 'meus-feedbacks.html';
            } else {
                backLink.href = 'index.html';
            }
        }
        
        // Check Auth
        const user = getAuthUser();
        const authBtn = document.getElementById('auth-btn-container');
        if (user && authBtn) {
            authBtn.innerHTML = `
                <div class="user-profile" onclick="logout()" title="Sair">
                    <span>Olá, ${user.username}</span>
                    <div class="avatar"><i class="fas fa-user"></i></div>
                </div>
            `;
        }
    }
});
