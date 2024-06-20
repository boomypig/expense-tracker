const URL = 'http://localhost:8080'


Vue.createApp({
    data(){
        return{
            expenses:[],
            sortOrder:"",
            searchInput:"",
            modalOpen: false,
            modal:{
                expense:"",
                amount:"",
                category:"",
                index:-1,
            },
            newExpense: {
                expense: "",
                amount: "", 
                category: "",
            },
        };
    },
    methods: { 
        getExpenses: async function() {
            let response = await fetch(`${URL}/expenses`);
            let data = await response.json();
            this.expenses = data;
            console.log(data);

        },
        sortExpenses: function() {
            if (this.sortOrder == "asc"){
                function compare(a,b){
                    if (a.amount > b.amount) return -1;
                    if (a.amount < b.amount) return 1;
                    return 0;
                }
                this.sortOrder = "desc";
            }else{
                function compare (a,b) {
                    if (a.amount < b.amount) return -1;
                    if (a.amount > b.amount) return 1;
                    return 0;
                }
                this.sortOrder = "asc"
            }
            this.expenses.sort(compare);
        },
        toggleModal: function (index = null) {
            this.modalOpen = !this.modalOpen;
            if (index !== null){
                let exp = this.expenses[index];
                this.modal.index = index;
                this.modal.expense = exp.expense;
                this.modal.amount = exp.amount;
                this.modal.category = exp.category;
            }
        },
        updateExpense: async function () {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            
            let encodedData =  "expense=" + 
                                encodeURIComponent(this.modal.expense) + 
                               "&amount=" + 
                               encodeURIComponent(this.modal.amount) + 
                               "&category=" + 
                               encodeURIComponent(this.modal.category);
        
            let requestOptions = {
                method: "PUT",
                body: encodedData,
                headers:myHeaders,
            };
            let expId = this.expenses[this.modal.index]._id;

            let response = await fetch(`${URL}/expenses/${expId}`, requestOptions);
            if (response.status == 204) {
                let exp = this.expenses[this.modal.index];
                exp.expense = this.modal.expense;
                exp.amount = parseFloat(this.modal.amount);
                exp.category = this.modal.category;
            }else{
                alert("failed to update expense")
            }
            this.toggleModal();
        },

        addExpense: async function() {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            let encodedData =  
            "expense=" + 
             encodeURIComponent(this.newExpense.expense) + 
             "&amount=" + 
             encodeURIComponent(this.newExpense.amount) + 
             "&category=" + 
             encodeURIComponent(this.newExpense.category);

             let requestOptions = {
                method: "POST",
                body: encodedData,
                headers: myHeaders,
            };
            fetch(`${URL}/expenses`, requestOptions).then((response) => {
                if (response.status === 201) {
                    response.json().then((data) => {
                        this.expenses.push(data);
                        this.newExpense = {};
                    });
                }else{
                    alert("not able to add expense")
                }
            });
        },

        deleteExpense: async function(index) {
            let requestOptions = {
                method:"DELETE"
            };
            let expID = this.expenses[index]._id;

            let response = await fetch(`${URL}/expenses/${expID}`,requestOptions);
            if (response.status == 204) {
                this.expenses.splice(index,1);
            }else{
                alert("Failed to delete expense")
            }
        }

    },
    computed: {
        balance: function(){
            let total = 0;
            for( expense of this.fileteredExpenses){
                total += parseInt(expense.amount);
            }
            return total;
        },

        fileteredExpenses: function() {
            return this.expenses.filter((expense)=> {
                return expense.expense.toLowerCase().includes(this.searchInput.toLowerCase());
            })
        }

    },
    created: function () {
        this.getExpenses();
    },
}).mount('#app');