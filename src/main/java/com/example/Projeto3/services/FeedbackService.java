package com.example.Projeto3.services;

import com.example.Projeto3.entities.Categoria;
import com.example.Projeto3.entities.Comentario;
import com.example.Projeto3.entities.Feedback;
import com.example.Projeto3.entities.Usuario;
import com.example.Projeto3.entities.Voto;
import com.example.Projeto3.repositories.ComentarioRepository;
import com.example.Projeto3.repositories.FeedbackRepository;
import com.example.Projeto3.repositories.UsuarioRepository;
import com.example.Projeto3.repositories.VotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ComentarioRepository comentarioRepository;
    private final VotoRepository votoRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository, 
                           ComentarioRepository comentarioRepository,
                           VotoRepository votoRepository,
                           UsuarioRepository usuarioRepository) {
        this.feedbackRepository = feedbackRepository;
        this.comentarioRepository = comentarioRepository;
        this.votoRepository = votoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Criar um novo feedback
    public Feedback createFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    // Obter todos os feedbacks
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    // Obter feedbacks por categoria
    public List<Feedback> getFeedbacksByCategoria(Categoria categoria) {return feedbackRepository.findByCategoria(categoria);}

    // Obter feedbacks por Usuário
    public List<Feedback> getFeedbacksByUserId(Long userId) {
        return feedbackRepository.findByUsuarioIdUser(userId);
    }

    // Obter um feedback por ID
    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    // Editar um feedback existente
    public Optional<Feedback> updateFeedback(Long id, Feedback feedbackDetails) {
        Optional<Feedback> optionalFeedback = feedbackRepository.findById(id);

        if (optionalFeedback.isPresent()) {
            Feedback feedbackExistente = optionalFeedback.get();
            feedbackExistente.setTitulo(feedbackDetails.getTitulo());
            feedbackExistente.setMensagem(feedbackDetails.getMensagem());
            feedbackExistente.setCategoria(feedbackDetails.getCategoria());
            feedbackExistente.setCurso(feedbackDetails.getCurso());

            return Optional.of(feedbackRepository.save(feedbackExistente));
        } else {
            return Optional.empty();
        }
    }

    // Deletar um feedback
    public boolean deleteFeedback(Long id) {
        if (feedbackRepository.existsById(id)) {
            feedbackRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Comentario> createComentario(Long feedbackId, Comentario comentario) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);

        if (feedbackOpt.isPresent()) {
            Feedback feedback = feedbackOpt.get();
            comentario.setFeedback(feedback);
            Comentario salvo = comentarioRepository.save(comentario);
            return Optional.of(salvo);
        } else {
            return Optional.empty();
        }
    }

    // Votar em feedback (Apenas um voto por usuário)
    public Optional<Feedback> voteFeedback(Long id, boolean upvote, Long userId) {
        Optional<Feedback> optionalFeedback = feedbackRepository.findById(id);
        Optional<Usuario> optionalUsuario = usuarioRepository.findById(userId);

        if (optionalFeedback.isPresent() && optionalUsuario.isPresent()) {
            Feedback feedback = optionalFeedback.get();
            Usuario usuario = optionalUsuario.get();

            // Verificar se já existe voto deste usuário para este feedback
            Optional<Voto> votoExistente = votoRepository.findByUsuarioAndFeedback(usuario, feedback);

            if (votoExistente.isPresent()) {
                // Se já existe, remove (toggle off)
                votoRepository.delete(votoExistente.get());
                feedback.setLikes(feedback.getLikes() - 1);
            } else {
                // Se não existe, cria (toggle on)
                Voto novoVoto = new Voto(usuario, feedback, true); // upvote param is now irrelevant/true
                votoRepository.save(novoVoto);
                feedback.setLikes(feedback.getLikes() + 1);
            }

            return Optional.of(feedbackRepository.save(feedback));
        }
        return Optional.empty();
    }

    // Get list of feedback IDs voted by user
    public List<Long> getVotedFeedbackIds(Long userId) {
        return votoRepository.findFeedbackIdsByUserId(userId);
    }

    // Obter Top 3 feedbacks por likes
    public List<Feedback> getTopFeedbacks() {
        return feedbackRepository.findTop3ByOrderByLikesDesc();
    }

}
