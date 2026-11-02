package com.hungerhub.service;

import com.hungerhub.model.*;
import com.hungerhub.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.*;
import java.util.*;

@Service
public class ShopService {
    private final ProductRepository products;
    private final CustomerRepository customers;
    private final BillRepository bills;
    public ShopService(ProductRepository p, CustomerRepository c, BillRepository b){products=p;customers=c;bills=b;}

    public List<Product> products(){return products.findAll();}
    public Product productByCode(String code){return products.findByCode(code).orElseThrow(()->new EntityNotFoundException("Product code not found: "+code));}
    public Product saveProduct(Product p){
        if(p.getCode()==null || !p.getCode().matches("\\d{4}")) throw new IllegalArgumentException("Product code must be exactly four digits.");
        if(p.getName()==null || p.getName().isBlank()) throw new IllegalArgumentException("Product name is required.");
        if(p.getPrice()==null || p.getPrice().compareTo(BigDecimal.ZERO)<=0) throw new IllegalArgumentException("MRP must be greater than zero.");
        if(p.getStock()==null || p.getStock()<0) throw new IllegalArgumentException("Stock cannot be negative.");
        products.findByCode(p.getCode()).ifPresent(existing->{if(p.getId()==null || !existing.getId().equals(p.getId())) throw new IllegalArgumentException("That product code already exists.");});
        return products.save(p);
    }
    public void deleteProduct(Long id){products.deleteById(id);}
    @Transactional public Product stockIn(String code,int quantity){
        if(quantity<=0) throw new IllegalArgumentException("Stock-in quantity must be greater than zero.");
        Product p=productByCode(code); p.setStock(p.getStock()+quantity); return products.save(p);
    }
    public List<Customer> customers(){return customers.findAll();}
    public Customer saveCustomer(Customer c){
        if(c.getName()==null||c.getName().isBlank()||c.getPhone()==null||c.getPhone().isBlank()||c.getRoomOrBlock()==null||c.getRoomOrBlock().isBlank())
            throw new IllegalArgumentException("Name, phone and room/block are required.");
        return customers.save(c);
    }
    public List<Bill> bills(){return bills.findAllByOrderByCreatedAtDesc();}
    public List<Bill> customerBills(Long id){return bills.findByCustomerIdOrderByCreatedAtDesc(id);}

    public record ItemRequest(String code, Integer quantity) {}
    public record BillRequest(Long customerId, Integer convenienceFeePercent, List<ItemRequest> items) {}

    @Transactional
    public Bill createBill(BillRequest request){
        Customer customer=customers.findById(request.customerId()).orElseThrow(()->new EntityNotFoundException("Customer not found."));
        int fee=request.convenienceFeePercent()==null?0:request.convenienceFeePercent();
        if(!List.of(0,5,10).contains(fee)) throw new IllegalArgumentException("Convenience fee must be 0%, 5% or 10%.");
        if(request.items()==null||request.items().isEmpty()) throw new IllegalArgumentException("Add at least one item.");
        Bill bill=new Bill(); bill.setCustomer(customer); bill.setCreatedAt(LocalDateTime.now()); bill.setConvenienceFeePercent(fee);
        BigDecimal subtotal=BigDecimal.ZERO;
        for(ItemRequest line:request.items()){
            if(line.quantity()==null||line.quantity()<=0) throw new IllegalArgumentException("Item quantity must be greater than zero.");
            Product p=products.findByCode(line.code()).orElseThrow(()->new EntityNotFoundException("Product code not found: "+line.code()));
            if(p.getStock()<line.quantity()) throw new IllegalArgumentException("Insufficient stock for "+p.getName()+". Available: "+p.getStock());
            p.setStock(p.getStock()-line.quantity()); products.save(p);
            BigDecimal lineTotal=p.getPrice().multiply(BigDecimal.valueOf(line.quantity())).setScale(2,RoundingMode.HALF_UP);
            subtotal=subtotal.add(lineTotal);
            BillItem item=new BillItem(); item.setProduct(p); item.setProductCode(p.getCode()); item.setProductName(p.getName());
            item.setQuantity(line.quantity()); item.setUnitPrice(p.getPrice()); item.setLineTotal(lineTotal); bill.addItem(item);
        }
        BigDecimal feeAmount=subtotal.multiply(BigDecimal.valueOf(fee)).divide(BigDecimal.valueOf(100),2,RoundingMode.HALF_UP);
        bill.setSubtotal(subtotal); bill.setConvenienceFeeAmount(feeAmount); bill.setGrandTotal(subtotal.add(feeAmount));
        bills.saveAndFlush(bill);
        bill.setBillNumber(String.format("HH-%04d",bill.getId()));
        return bills.save(bill);
    }
    public Map<String,Object> dailySummary(){
        LocalDate today=LocalDate.now(); LocalDateTime start=today.atStartOfDay(), end=today.plusDays(1).atStartOfDay();
        return Map.of("date",today.toString(),"totalBills",bills.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start,end),
            "totalSales",bills.dailyTotal(start,end));
    }
}
