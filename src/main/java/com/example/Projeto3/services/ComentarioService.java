package com.example.Projeto3.services;

import com.example.Projeto3.entities.Comentario;
import com.example.Projeto3.repositories.ComentarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;

    @Autowired
    public ComentarioService(ComentarioRepository comentarioRepository) {this.comentarioRepository = comentarioRepository;}

    // Criar um novo comentário
    public Comentario createComentario(Comentario comentario) {
        return comentarioRepository.save(comentario);
    }

    public List<Comentario> getComentariosByFeedbackId(Long feedbackId) {
        return comentarioRepository.findByFeedback_IdFeedback(feedbackId);
    }

    public Optional<Comentario> getComentarioById(Long id) {
        return comentarioRepository.findById(id);
    }

    // Editar um comentário existente
    public Optional<Comentario> updateComentario(Long id, Comentario comentarioDetails) {
        Optional<Comentario> optionalComentario = comentarioRepository.findById(id);

        if (optionalComentario.isPresent()) {
            Comentario comentarioExistente = optionalComentario.get();
            comentarioExistente.setMensagem(comentarioDetails.getMensagem());

            return Optional.of(comentarioRepository.save(comentarioExistente));
        } else {
            return Optional.empty();
        }
    }

    // Deletar comentário (se for dono)
    public boolean deleteComentario(Long id, Long userId) {
        Optional<Comentario> opt = comentarioRepository.findById(id);
        if (opt.isPresent()) {
            Comentario c = opt.get();
            // Check if user is owner
            if (c.getUsuario().getIdUser() == userId) {
                comentarioRepository.deleteById(id);
                return true;
            }
        }
        return false;
    }

}
