package com.hungerhub.repository;
import com.hungerhub.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CustomerRepository extends JpaRepository<Customer,Long> {}
