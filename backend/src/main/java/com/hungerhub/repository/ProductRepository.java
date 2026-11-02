package com.hungerhub.repository;
import com.hungerhub.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ProductRepository extends JpaRepository<Product,Long> {
    Optional<Product> findByCode(String code);
    boolean existsByCode(String code);
}
