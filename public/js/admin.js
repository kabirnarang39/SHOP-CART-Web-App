const deleteProduct=(button)=>{
    const prodId=button.parentNode.querySelector('[name=id]').value;
    const csrf=button.parentNode.querySelector('[name=_csrf]').value;
    const element=button.closest('article')
    fetch('/admin/product/'+prodId,{
        method:'DELETE',
        headers:{
            'csrf-token':csrf
        }
    }).then(result=>{
        return result.json();
    })
    .then(data=>{
     element.parentNode.removeChild(element)
    })
    .catch(err=>{
        console.log(err)
    })
}