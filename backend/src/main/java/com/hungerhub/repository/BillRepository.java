package com.hungerhub.repository;
import com.hungerhub.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
public interface BillRepository extends JpaRepository<Bill,Long> {
    List<Bill> findAllByOrderByCreatedAtDesc();
    List<Bill> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Bill> findByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    @Query("select coalesce(sum(b.grandTotal),0) from Bill b where b.createdAt >= :start and b.createdAt < :end")
    BigDecimal dailyTotal(@Param("start") LocalDateTime start,@Param("end") LocalDateTime end);
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(LocalDateTime start, LocalDateTime end);
}
