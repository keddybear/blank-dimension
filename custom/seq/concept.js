/* eslint-disable */

/*
	Single Endpoint Query

	Single Endpoint Query (SEQ) is a server endpoint that handles all database queries to avoid
	request roundtrips when fetching data from the backend.

	For example, a server can have multiple endpoints that deal with different tables in a
	database. When those tables are related to each other - say, they have a one-to-many
	relationship, fetching data from two related tables could result in many GET requests,
	slowing down performance.

	To resolve this, one endpoint is designed to parse user queries and populate requested
	fields with results. A query could look like this:

	{
		authors: {
			conditions: {
				id: "12345"
				sort: {
					field: "name",
					order: "asc"
				},
				max: 50
			},
			fields: {
				name,
				books: {
					conditions: {
						greaterOrEqual: {
							field: "rating",
							value: 9.0
						},
						sort {
							field: "rating",
							order: "desc"
						}
					},
					fields: {
						name,
						rating
					}
				}
			}

		}
	}

	The endpoint should have an API that handles the communication between user queries and the
	database.

	The next step of optimization is to avoid the "N+1" problem. For example, we fetch 50 authors
	and also want to list a maximum of 10 books for each author. Since one author can have
	multiple books, this will require access to database 50 + 1 times.

	In order to minimize the number of retrievals, one solution is to batch the derived queries
	and delay them until their parent queries are finished. This will take a total of 1 + 1 times
	of database access.

	Here's an overview of a Single Endpoint Query design:

	##########          #############          #############          ################          ############
	#        #          #           #          #           #          #              #          #          #
	#        # ---->>>> #  SEQ API  # ---->>>> #  SEQ API  # ---->>>> #              # ---->>>> #          #
	# Client #          #           #          #           #          # Datebase API #          # Database #
	#        # <<<<---- #    (FE)   # <<<<---- #    (BE)   # <<<<---- #              # <<<<---- #          #
	#        #          #           #          #           #          #              #          #          #
	##########          #############          #############          ################          ############

	---------------------------------          -------------------------------------------------------------
	           Frontned                                                    Backend

	1. Frontend SEQ API
	---->>>>
		- Sanitize user input
		- Create queries from user input
		- Send queries to server
	<<<<----
		- Create ready-to-use results from server response

	2. Backend SEQ API
	---->>>>
		- Parse user queries
		- Sanitize queries
		- Batch derived queries
		- Run queries
	<<<<----
		- Populate fields in queries
		- Send results back to client

	3. Database API
		- This API provides SEQ with methods that abstract database transactions.

	4. Database
		- NoSQL is recommended.
		- Optimize database with efficient schema and indices.
*/
