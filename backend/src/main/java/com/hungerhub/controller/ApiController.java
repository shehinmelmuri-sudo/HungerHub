package com.hungerhub.controller;

import com.hungerhub.model.*;
import com.hungerhub.service.ShopService;
import com.hungerhub.service.ShopService.BillRequest;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final ShopService shop;
    public ApiController(ShopService shop){this.shop=shop;}

    @GetMapping("/products") public List<Product> products(){return shop.products();}
    @GetMapping("/products/code/{code}") public Product product(@PathVariable String code){return shop.productByCode(code);}
    @PostMapping("/products") public Product addProduct(@Valid @RequestBody Product p){p.setId(null);return shop.saveProduct(p);}
    @PutMapping("/products/{id}") public Product updateProduct(@PathVariable Long id,@Valid @RequestBody Product p){p.setId(id);return shop.saveProduct(p);}
    @DeleteMapping("/products/{id}") public ResponseEntity<Void> deleteProduct(@PathVariable Long id){shop.deleteProduct(id);return ResponseEntity.noContent().build();}
    @PostMapping("/stock-in") public Product stockIn(@RequestBody Map<String,Object> body){
        return shop.stockIn(String.valueOf(body.get("code")),Integer.parseInt(String.valueOf(body.get("quantity"))));
    }
    @GetMapping("/customers") public List<Customer> customers(){return shop.customers();}
    @PostMapping("/customers") public Customer addCustomer(@Valid @RequestBody Customer c){c.setId(null);return shop.saveCustomer(c);}
    @PutMapping("/customers/{id}") public Customer updateCustomer(@PathVariable Long id,@Valid @RequestBody Customer c){c.setId(id);return shop.saveCustomer(c);}
    @GetMapping("/customers/{id}/bills") public List<Bill> customerBills(@PathVariable Long id){return shop.customerBills(id);}
    @GetMapping("/bills") public List<Bill> bills(){return shop.bills();}
    @PostMapping("/bills") public Bill createBill(@RequestBody BillRequest request){return shop.createBill(request);}
    @GetMapping("/summary/daily") public Map<String,Object> summary(){return shop.dailySummary();}
}
