export const verifyTokenOwner = (request, resourceUserID) => {

	const authenticatedUserID = request.user?.userID;

	if (!authenticatedUserID) {
		return {
			error: "Unauthorised - invalid or missing token",
			code: 401
		}
	}

	if (!resourceUserID) {
		return {
			error: "Resource userID is required",
			code: 400
		}
	}

	const authID = parseInt(authenticatedUserID);

	if (isNaN(authID) ) {
		return {
			error: "Invalid userID format",
			code: 400
		}
	}

	if (authID !== resourceUserID) {
		return {
			error: "Forbidden - you can only modify your own resources",
			code: 403,
		};
  }

	return (null);
}