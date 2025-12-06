package com.example.Projeto3.repositories;

import com.example.Projeto3.entities.Feedback;
import com.example.Projeto3.entities.Usuario;
import com.example.Projeto3.entities.Voto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VotoRepository extends JpaRepository<Voto, Long> {
    Optional<Voto> findByUsuarioAndFeedback(Usuario usuario, Feedback feedback);

    @Query("SELECT v.feedback.idFeedback FROM Voto v WHERE v.usuario.idUser = :userId")
    List<Long> findFeedbackIdsByUserId(@Param("userId") Long userId);
}
