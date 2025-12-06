package com.example.Projeto3.repositories;

import com.example.Projeto3.entities.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.Projeto3.entities.Feedback;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByCategoria(Categoria categoria);
    List<Feedback> findByUsuarioIdUser(Long idUser);
    List<Feedback> findTop3ByOrderByLikesDesc();
}
