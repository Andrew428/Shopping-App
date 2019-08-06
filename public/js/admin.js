

const deleteProduct = (btn) => {
    const productId = btn.parentNode.children[2].value;   
    const csrf = btn.parentNode.children[3].value; 
    const productArtical = btn.closest('article');

    var c = confirm('This will delete the item forever and it can NOT be recovered!  Are you sure?');
    if (c == true) {
        fetch('/admin/product/'+productId, {
            method: "DELETE",
            headers: {
                'csrf-token':csrf
            }
        }).then(result => {
            if(result.status === 200){
                productArtical.parentNode.removeChild(productArtical);               
            }
        }).catch(err => {
            console.log(err);
        })
    } 

   
}