import { Component } from '@angular/core';
import { ProductsService } from './products.service';
import { Observable } from 'rxjs';
import { Product } from './product.model';
import { MatSnackBar, MatSnackBarConfig, MatDialog } from '@angular/material';
import { DialogEditProductComponent } from './dialog-edit-product/dialog-edit-product.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  simpleReqProductObservable$: Observable<Product[]>;
  productsErrorHandling: Product[];
  productsLoading: Product[];
  bLoading: boolean = false;
  productsIds: Product[];
  newlyProducts: Product[] = [];
  prodToDelete: Product[];
  productsToEdit: Product[];

  constructor(private ProductService: ProductsService,
              private snackbar: MatSnackBar,
              private dialog: MatDialog) {

  }

  ngOnInit() {

  }

  getSimpleHttpRequest() {
    this.simpleReqProductObservable$ = this.ProductService.getProducts() 
    // subcribe pelo angular <list *ngIf="simpleReqProductObservable$ | async">
  }

  getProductWithErrorHandling() {
    this.ProductService.getProductsError()
      .subscribe(
        (prods) => {this.productsErrorHandling = prods},
        (err) => {
          console.log(err);
          console.log("Message: " + err.error.msn);
          console.log("Status: " + err.status);
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          config.panelClass= ['snack_error'] // esta classe deve ser colocada no css global (styles.css)

          if(err.status === 0)
            this.snackbar.open("Could not connect to the server", '', config);
          else
          this.snackbar.open(err.error.msn, '', config);

        }
      )
  }

  getProductWithErrorHandlingOk() {
    this.ProductService.getProductsDelay()
    .subscribe(
      (prods) => {
        this.productsErrorHandling = prods;
        let config = new MatSnackBarConfig();
        config.duration = 2000;
        config.panelClass= ['snack_error']; // esta classe deve ser colocada no css global (styles.css)
        this.snackbar.open("Successfuly loaded", '', config);
      },
      (err) => {
        console.log(err);
      }
  )}


  getProductsLoading(){
    this.bLoading = true;
    this.ProductService.getProductsDelay()
    .subscribe(
      (prods) => {
        this.productsLoading = prods;
        this.bLoading = false;

      },
      (err) => {
        console.log(err);
        this.bLoading = false;

      }
    )
  }


  getProductsIds() {
    this.ProductService.getProductsId()
      .subscribe((ids)=> {
        this.productsIds = ids.map(id => ({_id: id, name: '', department: '', price: 0}))
      })

  }

  loadName(id: string) {
    this.ProductService.getProductName(id)
      .subscribe(
       ( name => {
          let index = this.productsIds.findIndex(p=>p._id === id);
          if(index >=0)
            this.productsIds[index].name = name
        })
      )
  }


  saveProduct(name: string, department: string, price: number){
    let p = {name, department, price};
       this.ProductService.saveProduct(p)
        .subscribe(
          (p: Product) => {
            console.log(p);
            this.newlyProducts.push(p);
          },
          (err) => {
            console.log(err);
            let config = new MatSnackBarConfig();
            config.duration = 2000;
            config.panelClass= ['snack_error']; // esta classe deve ser colocada no css global (styles.css)
            this.snackbar.open("Server error", '', config);
          }

        )
  }


  loadProductsToDelete(){
    this.ProductService.getProducts()
      .subscribe((prods) => this.prodToDelete = prods)
  }

  deleteProduct(p: Product) {
    this.ProductService.deleteProduct(p)
      .subscribe(
        (res) => {
          let i = this.prodToDelete.findIndex(prod=>p._id == prod._id);
          if(i>=0)
            this.prodToDelete.splice(i, 1);
        },
        (err)=>{
          console.log(err)
        }
      )
  }


  
  loadProductsToEdit() {
    this.ProductService.getProducts()
    .subscribe((prods) => this.productsToEdit = prods);    
  }
  
  editProduct(p: Product) {
    let newProduct: Product = {...p}      // Object.assign({}, p)
    let dialogRef = this.dialog.open(DialogEditProductComponent, {width:'400px', data: newProduct}) // se colocar o p diretamente ele ira atualizar no card enquanto edita, mas só atulalizara qnd salvar
    dialogRef.afterClosed()
      .subscribe((res: Product)=> {
        if(res){
          this.ProductService.editProduct(res)
            .subscribe(
                (res) => {
                  let i = this.productsToEdit.findIndex(prod=>p._id == prod._id)
                  if(i >=0)
                    this.productsToEdit[i] = res;
        
                },
                (err) => {
                  console.log(err)
                }
            )
        }


      })
  }

}
